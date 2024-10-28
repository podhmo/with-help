// import { parseArgs } from "jsr:podhmo/with-help"
import { buildHelp, parseArgs } from "../mod.ts";

const flagsDefinition = {
    string: ["version"],
    boolean: ["color", "help"],
    negatable: ["color"],
    default: { color: true },

    // more options
    name: "cli-example",
    description: "this is cli-example",
    required: ["version"],
}

console.log(buildHelp(flagsDefinition));

const flags = parseArgs(Deno.args, flagsDefinition);

// deno run cli-example.ts --version=1.0.0
// deno run cli-example.ts --no-color --version=1.0.0
//
// hmm
// deno run cli-example.ts
// deno run cli-example.ts --colr=false --version=1.0.0 x y z

console.dir(flags, { depth: null });
console.dir(flags._, { depth: null });
