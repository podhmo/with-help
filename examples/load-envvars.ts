import { parseArgs } from "../src/parse-args.ts";

// deno run --allow-env ./examples/load-envvars.ts --name foo
// OVERRIDE_NAME=bar deno run --allow-env ./examples/load-envvars.ts
// OVERRIDE_NAME=bar deno run --allow-env ./examples/load-envvars.ts --name foo
//
// deno run --allow-env ./examples/load-envvars.ts --name foo --no-color
// VERBOSE=true COLOR=1 deno run --allow-env ./examples/load-envvars.ts --name foo --no-color
//
// deno run --allow-env ./examples/load-envvars.ts --name foo --item a --item b
// ITEM=X ITEM=Y deno run --allow-env ./examples/load-envvars.ts --name foo
// ITEM=X ITEM=Y deno run --allow-env ./examples/load-envvars.ts --name foo --item a --item b
const args = parseArgs(
  Deno.args,
  {
    string: ["name", "item"],
    boolean: ["verbose", "color"],
    negatable: ["color"],
    required: ["name"],
    collect: ["item"],
    default: { item: ["default-item"] },
    envvar: {
      name: "OVERRIDE_NAME",
      color: "COLOR", // if COLOR=1 set args.color=true, if COLOR=0 set args.color=false (even if --no-color is set)
      verbose: "VERBOSE",
      item: "ITEM", // set args.item=ITEM (but only 1 value, so multiple values are not supported)
    },
  } as const,
);

console.log(`name=${args.name}, envvar=${Deno.env.get("OVERRIDE_NAME")}`);
console.log(`verbose=${args.verbose}, envvar=${Deno.env.get("VERBOSE")}`);
console.log(`color=${args.color}, envvar=${Deno.env.get("COLOR")}`);
console.log(`item=${args.item}, envvar=${Deno.env.get("ITEM")}`);
