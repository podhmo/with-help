import { parseArgs } from "../src/parse-args.ts";

// deno run --allow-env ./_examples/load-envvars.ts --name foo
// OVERRIDE_NAME=bar deno run --allow-env ./_examples/load-envvars.ts
// OVERRIDE_NAME=bar deno run --allow-env ./_examples/load-envvars.ts --name foo
//
// deno run --allow-env ./_examples/load-envvars.ts --name foo --no-color
// VERBOSE=true COLOR=1 deno run --allow-env ./_examples/load-envvars.ts --name foo --no-color
const args = parseArgs(
  Deno.args,
  {
    string: ["name"],
    boolean: ["verbose", "color"],
    negatable: ["color"],
    required: ["name"],
    envvar: {
      name: "OVERRIDE_NAME",
      color: "COLOR", // if COLOR=1 set args.color=true, if COLOR=0 set args.color=false (even if --no-color is set)
      verbose: "VERBOSE",
    },
  } as const,
);

console.log(`name=${args.name}, envvar=${Deno.env.get("OVERRIDE_NAME")}`);
console.log(`verbose=${args.verbose}, envvar=${Deno.env.get("VERBOSE")}`);
console.log(`color=${args.color}, envvar=${Deno.env.get("COLOR")}`);
