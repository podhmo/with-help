import { moreStrict, parseArgs } from "../parse-args.ts";

const directions = ["north", "south", "east", "west"] as const;

function main() {
  // In actual code, you don't need to write such types, you can leave it to inference.
  type WantType = { name: string; direction: "north" | "south" | "east" | "west" };
  type GotType = { name: string; direction: string };

  // parse arguments
  const args = parseArgs(Deno.args, {
    description: "use choices",
    string: ["name", "direction"],
    required: ["name", "direction"],
    default: { name: "world" },
    flagDescription: {
      direction: `(required) choose one of: ${JSON.stringify(directions)}`,
    },
  });

  // type check
  const _: GotType = args;

  // restrict to desired type
  const choices = moreStrict(args).choices;
  const args2: WantType = { ...args, direction: choices(args.direction, directions) };

  console.dir(args2, { depth: null });
}

if (import.meta.main) {
  main();
}
