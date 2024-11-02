// import { parseArgs } from "jsr:@podhmo/with-help"
import { parseArgs } from "../src/parse-args.ts";

const flags = parseArgs(
  Deno.args,
  {
    // original options (jsr:@std/cli/parse-args)
    string: ["version", "item"],
    boolean: ["color"],
    negatable: ["color"],
    collect: ["item"],

    // more options
    required: ["version"],
    name: "cli-example",
    description: "this is cli-example",
  } as const,
);

// ** success case **
// deno run ./_examples/cli-example.ts --version=1.0.0
// deno run ./_examples/cli-example.ts --no-color --version=1.0.0
// deno run ./_examples/cli-example.ts --help
//
// ** error case **
// deno run ./_examples/cli-example.ts
// deno run ./_examples/cli-example.ts --colr=false --version=1.0.0 x y z

console.dir(flags, { depth: null });
console.dir(flags._, { depth: null });
