import { parseArgs } from "jsr:@std/cli/parse-args";
import * as path from "jsr:@std/path";

const args = parseArgs(Deno.args, {
  string: ["port"],
});

const [filename] = args._;

if (typeof filename !== "string") {
  console.error("No file specified");
  Deno.exit(1);
}

const mod = await import(path.join(Deno.cwd(), filename));

let handler;
if (mod.default) {
  handler = mod.default;
} else {
  const exports = Object.values(mod);
  if (exports.length != 1) {
    console.error(
      "Vals require a default export, or exactly one named export."
    );
    Deno.exit(1);
  }

  handler = exports[0];
}

Deno.serve(
  {
    port: parseInt(args.port || "8000"),
  },
  handler
);
