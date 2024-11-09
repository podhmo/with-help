import { parseArgs } from "../parse-args.ts";
import { buildHelp } from "../build-help.ts";

const directions = ["north", "south", "east", "west"] as const;
type DirectionType = typeof directions[number];

const options = {
  string: ["name", "direction"],
  boolean: ["color"],
  negatable: ["color"],
  required: ["name", "direction"],
  default: { name: "world" },
  flagDescription: {
    direction: `(required) choose one of: ${JSON.stringify(directions)}`,
  },
} as const;

function main() {
  // args is of type { name: string, direction: string }
  const args = parseArgs(Deno.args, options);
  if (!directions.includes(args.direction as DirectionType)) {
    console.log(buildHelp(options));
    console.error(`Invalid direction: "${args.direction}" is not one of ${JSON.stringify(directions)}`);
    Deno.exit(1);
  }

  // args2 is of type { name: string, direction: DirectionType }
  const args2 = { ...args, direction: args.direction as DirectionType };

  console.dir(args2, { depth: null });
}

if (import.meta.main) {
  main();
}
