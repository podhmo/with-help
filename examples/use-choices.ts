import { parseArgs, Restriction } from "../parse-args.ts";

const directions = ["north", "south", "east", "west"] as const;

const options = {
  description: "use choices",
  string: ["name", "direction"],
  required: ["name", "direction"],
  default: { name: "world" },
  flagDescription: {
    direction: `(required) choose one of: ${JSON.stringify(directions)}`,
  },
} as const;

function main() {
  // In actual code, you don't need to write such types, you can leave it to inference.
  type WantType = { name: string; direction: "north" | "south" | "east" | "west" };
  type GotType = { name: string; direction: string };

  // parse arguments
  const args: GotType = parseArgs(Deno.args, options);

  // restrict to desired type
  const restriction = new Restriction(options);
  const args2: WantType = { ...args, direction: restriction.choices(args.direction, directions) };

  console.dir(args2, { depth: null });
}

if (import.meta.main) {
  main();
}
