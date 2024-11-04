import { parseArgs } from "../src/parse-args.ts";

// deno run --allow-env ./_examples/load-envvars.ts --name foo
// OVERRIDE_NAME=bar deno run --allow-env ./_examples/load-envvars.ts
// OVERRIDE_NAME=bar deno run --allow-env ./_examples/load-envvars.ts --name foo

const args = parseArgs(Deno.args, {
    string: ["name"],
    required: ["name"],
    envvar: {
        name: "OVERRIDE_NAME"
    }
} as const);

console.log(`name=${args.name}, envvar=${Deno.env.get("OVERRIDE_NAME")}`);