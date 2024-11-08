import { parseArgs } from "../src/parse-args.ts";
import { buildHelp } from "../src/build-help.ts";

const directions = ["north", "south", "east", "west"] as const;
type DirectionType = typeof directions[number];

// args is of type { name: string, direction: string }
const args = parseArgs(Deno.args, {
    string: ["name", "direction"],
    required: ["name", "direction"],
    default: { name: "world" },
});

if(!directions.includes(args.direction as DirectionType)) {
    console.log(buildHelp({})) // TODO: help message
    console.error(`Invalid direction: "${args.direction}" is not one of ${JSON.stringify(directions)}`);
    Deno.exit(1);
}

// args2 is of type { name: string, direction: DirectionType }
const args2 = {...args, direction: args.direction as DirectionType};

console.dir(args2, { depth: null });