import { parseArgs, printHelp } from "../parse-args.ts";

// deno run -A examples/build-subcommands.ts --help
// deno run -A examples/build-subcommands.ts post --help
// deno run -A examples/build-subcommands.ts list-models --help
//
// deno run -A examples/build-subcommands.ts --apiKey=world post --title hello
// API_KEY=foo deno run -A examples/build-subcommands.ts list-models --format json

interface BaseOptions {
  apiKey: string;
}

function main() {
  // base command
  const baseOptions = parseArgs(Deno.args, {
    name: "subcommand-example",
    stopEarly: true, // need this!
    string: ["apiKey"],
    required: ["apiKey"],
    envvar: {
      apiKey: "API_KEY",
    },
    footer: `
Available subcommands:
  post -- post something
  list-models -- listing models`,
  });

  if (baseOptions._.length === 0) {
    printHelp(baseOptions);
    console.error("subcommand is required");
    Deno.exit(1);
  }

  const args = baseOptions._;
  switch (args[0]) {
    case "post":
      return post(args.slice(1), baseOptions);
    case "list-models":
      return listModels(args.slice(1), baseOptions);
    default:
      console.error(`unknown subcommand ${baseOptions._[0]}`);
      Deno.exit(1);
  }
}

function post(args: string[], baseOptions: BaseOptions) {
  const options = parseArgs(args, {
    name: "post",
    string: ["title"],
    required: ["title"],
    envvar: {
      title: "TITLE",
    },
  });

  console.dir({ name: "post", options, baseOptions }, { depth: null });
}

function listModels(args: string[], baseOptions: BaseOptions) {
  const options = parseArgs(args, {
    name: "list-models",
    string: ["format"],
    flagDescription: {
      format: "output format (json, text)",
    },
  });

  console.dir({ name: "list-models", options, baseOptions }, { depth: null });
}

if (import.meta.main) {
  main();
}
