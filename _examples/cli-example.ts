import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
    options: {
        "no-color": { type: 'boolean', default: false },
        version: { type: 'string', alias: 'v' }
    },
    allowPositionals: true
});
const flags = { ...values, color: !values["no-color"] };

// deno run cli-example.ts --version=1.0.0
// deno run cli-example.ts --no-color --version=1.0.0
//
// hmm
// deno run cli-example.ts 
// deno run cli-example.ts --colr=false --version=1.0.0 x y z
console.dir(flags, { depth: null });
console.dir(positionals, { depth: null });