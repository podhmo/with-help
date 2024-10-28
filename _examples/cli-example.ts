// import { parseArgs } from "jsr:podhmo/with-help"
import { parseArgs } from "../mod.ts";

const flags = parseArgs(Deno.args, {
    string: ["version", "item"],
    boolean: ["color"],
    negatable: ["color"],
    collect: ["item"],

    // more options
    name: "cli-example",
    description: "this is cli-example",
    required: ["version"],
});

// deno run cli-example.ts --version=1.0.0
// deno run cli-example.ts --no-color --version=1.0.0
//
// hmm
// deno run cli-example.ts
// deno run cli-example.ts --colr=false --version=1.0.0 x y z

console.dir(flags, { depth: null });
console.dir(flags._, { depth: null });
