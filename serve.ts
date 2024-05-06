import { parseArgs } from "jsr:@std/cli/parse-args";
import * as path from "jsr:@std/path";

function getMainExport(
  mod: any
): { ok: true; value: any } | { ok: false; error: Error } {
  if ("default" in mod) {
    return { ok: true, value: mod.default };
  }

  // If the val has exactly one named export, we run that.

  const exports = Object.keys(mod);

  if (exports.length > 1) {
    const error = new Error(
      `Vals require a default export, or exactly one named export. This val exports: ${exports.join(
        ", "
      )}`
    );
    error.name = "ImportValError";
    return { ok: false, error };
  } else if (exports.length === 0) {
    const error = new Error(
      "Vals require a default export, or exactly one named export. This val has none."
    );
    error.name = "ImportValError";
    return { ok: false, error };
  }

  return { ok: true, value: mod[exports[0]] };
}

const args = parseArgs(Deno.args, {
  string: ["port"],
});

const [filename] = args._;

if (typeof filename !== "string") {
  console.error("No file specified");
  Deno.exit(1);
}

const mod = await import(path.join(Deno.cwd(), filename));

const exp = getMainExport(mod);
if (!exp.ok) {
  console.error(exp.error);
  Deno.exit(1);
}
const handler = exp.value;

Deno.serve(
  {
    port: parseInt(args.port || "8000"),
  },
  handler
);
