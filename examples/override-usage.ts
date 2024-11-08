import { buildUsage, parseArgs } from "../src/mod.ts";

const name = "override-usage-example";
const args = parseArgs(
  Deno.args,
  {
    usageText: `${buildUsage({ name })} [file]...`,
    boolean: ["list"],
    alias: { l: "list" },
  },
);

if (args.list) {
  for (const file of args._) {
    console.log(`- ${file}`);
  }
} else {
  console.log(args._.join(" "));
}

// $ deno run examples/override-usage.ts --help
// Usage: override-usage-example [options] [file]...

// Options:
//   --list    (default: list=false)
//   --help    show help
