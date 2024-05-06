import { encodeHex } from "jsr:@std/encoding/hex";
import { existsSync } from "jsr:@std/fs/exists";
import * as dotenv from "jsr:@std/dotenv";

const valtownToken = Deno.env.get("VALTOWN_TOKEN");
if (!valtownToken) {
  console.error("VALTOWN_TOKEN is required");
  Deno.exit(1);
}

export async function fetchEnv() {
  const { data: res, error } = await fetchValTown("/v1/eval", {
    method: "POST",
    body: JSON.stringify({
      code: "JSON.stringify(Deno.env.toObject())",
      args: [],
    }),
  });

  if (error) {
    throw error;
  }

  return JSON.parse(res);
}

export async function fetchValTown<T = any>(
  path: string,
  options?: RequestInit & {
    paginate?: boolean;
  }
): Promise<{ data: T; error?: Error }> {
  const apiURL = Deno.env.get("API_URL") || "https://api.val.town";
  const headers = {
    ...options?.headers,
    Authorization: `Bearer ${valtownToken}`,
  };
  if (options?.paginate) {
    const data = [];
    let url = new URL(`${apiURL}${path}`);
    url.searchParams.set("limit", "100");

    while (true) {
      const resp = await fetch(url, {
        headers,
      });
      if (!resp.ok) {
        throw new Error(await resp.text());
      }

      const res = (await resp.json()) as {
        data: unknown[];
        links: { next?: string };
      };
      data.push(...res.data);

      if (!res.links.next) {
        break;
      }

      url = new URL(res.links.next);
    }

    return { data } as { data: T };
  }

  const resp = await fetch(`${apiURL}${path}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    const text = await resp.text();
    return { data: text as T, error: new Error(text) };
  }

  if (resp.headers.get("content-type")?.startsWith("application/json")) {
    const data = (await resp.json()) as T;
    return { data };
  }

  const text = await resp.text();
  return { data: text } as { data: T };
}
type Meta = {
  id: string;
  name: string;
  hash: string;
};

const lock: Record<string, Meta> = existsSync("vt.lock")
  ? JSON.parse(Deno.readTextFileSync("vt.lock"))
  : {};

if (!existsSync("vals")) {
  Deno.mkdirSync("vals");
}
const files = [...Deno.readDirSync("vals")]
  .filter((f) => f.isFile && f.name.endsWith(".tsx"))
  .map((f) => f.name);
for (const file of files) {
  const meta = lock[file];
  // val does not exist remotely, create it
  const code = Deno.readTextFileSync(`vals/${file}`);
  if (!meta) {
    if (confirm(`Create ${file} remotely?`)) {
      const { data } = await fetchValTown("/v1/vals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: file.slice(0, -4), code }),
      });

      lock[file] = {
        id: data.id,
        name: file.slice(0, -4),
        hash: await encodeHex(
          await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code))
        ),
      };
      continue;
    }
  }

  const hash = await encodeHex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code))
  );
  if (hash === meta.hash) {
    continue;
  }

  console.log(`Updating ${file}`);
  const { error } = await fetchValTown(`/v1/vals/${meta.id}/versions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (error) {
    console.error(error);
    Deno.exit(1);
  }

  lock[file] = {
    ...meta,
    hash,
  };
}

const localVals: Record<string, Meta> = {};
for (const [name, meta] of Object.entries(lock)) {
  if (!existsSync(`vals/${name}`)) {
    if (
      confirm(`Val ${name} was deleted. Do you want to delete it remotely?`)
    ) {
      await fetchValTown(`/v1/vals/${meta.id}`, { method: "DELETE" });
      delete lock[name];
    }
    continue;
  }

  localVals[meta.id] = meta;
}

// remote -> local
const { data: me } = await fetchValTown("/v1/me");
const { data: vals } = await fetchValTown(`/v1/users/${me.id}/vals`, {
  paginate: true,
});

const remoteVals: Record<string, any> = Object.fromEntries(
  vals.map((val: any) => [val.id, val])
);
for (const [id, meta] of Object.entries(localVals)) {
  if (!remoteVals[id]) {
    if (
      confirm(
        `Val ${meta.name} was deleted remotely. Do you want to delete it locally?`
      )
    ) {
      Deno.remove(`vals/${meta.name}.tsx`);
      delete lock[`${meta.name}.tsx`];
    }
  }
}

for (const val of Object.values(remoteVals)) {
  const meta = localVals[val.id];
  const filename = `${val.name}.tsx`;
  const hash = await encodeHex(
    await crypto.subtle.digest("SHA-256", new TextEncoder().encode(val.code))
  );

  // val does not exist locally, create it
  if (!meta) {
    console.log(`Creating ${filename}`);

    const code = val.code;
    Deno.writeTextFileSync(`vals/${filename}`, code);

    lock[filename] = {
      id: val.id,
      name: val.name,
      hash: await encodeHex(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code))
      ),
    };
    continue;
  }

  if (hash !== meta.hash) {
    if (confirm(`Update ${filename}?`)) {
      const {
        data: { code },
      } = await fetchValTown(`/v1/vals/${val.id}`);
      Deno.writeTextFileSync(`vals/${val.name}.tsx`, code);

      lock[`${val.name}.tsx`] = {
        ...meta,
        hash: await encodeHex(
          await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code))
        ),
      };
    }
  }

  if (val.name != meta.name) {
    console.log(`Renaming ${meta.name}.tsx to ${val.name}.tsx`);
    Deno.rename(`vals/${meta.name}.tsx`, `vals/${val.name}.tsx`);
    lock[`${val.name}.tsx`] = {
      ...meta,
      name: val.name,
    };

    delete lock[`${meta.name}.tsx`];
  }
}

const remoteEnv = await fetchEnv();
const localEnv = existsSync("val-town.env")
  ? dotenv.parse(Deno.readTextFileSync("val-town.env"))
  : {};
if (JSON.stringify(remoteEnv) !== JSON.stringify(localEnv)) {
  Deno.writeTextFileSync("val-town.env", dotenv.stringify(remoteEnv));
}

Deno.writeTextFileSync(
  "import_map.json",
  JSON.stringify(
    {
      imports: {
        [`https://esm.town/v/${me.username}/`]: "./vals/",
      },
    },
    null,
    2
  )
);

Deno.writeTextFileSync("vt.lock", JSON.stringify(lock, null, 2));
