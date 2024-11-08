# with-help

The `with-help` library extends Deno's standard `@std/cli.parseArgs()` with added functionality for displaying a help message. This library simplifies creating command-line interfaces by automatically providing a help message and additional configuration options.

## Motivation

This library was inspired by a discussion in the Node.js community ([nodejs/tooling#19](https://github.com/nodejs/tooling/issues/19)), where there was debate about whether automated help output was overly ambitious. The author disagreed, seeing it as beneficial.

## How to Use

Using `with-help` is almost identical to Deno's `parseArgs()` function (`jsr:@std/cli/parse-args.parseArgs()`), but it includes additional options for enhancing CLI functionality.

Here’s an example:

```ts
import { parseArgs } from "jsr:@podhmo/with-help";

const flags = parseArgs(
  Deno.args,
  {
    // Standard options from `@std/cli/parse-args`
    string: ["version", "item"],        // `version` and `item` expect string values
    boolean: ["color"],                 // `color` expects a boolean value
    negatable: ["color"],               // Allows toggling `color` (e.g., `--no-color`)
    collect: ["item"],                  // `item` accepts multiple values as an array of strings

    // Extended options
    required: ["version"],              // Marks `version` as a required string
    name: "cli-example",                // Sets the CLI tool’s name
    description: "this is cli-example", // Description shown in help output
  } as const,
);
```

### Example Output

When you run the command with `--help`, it displays automatically generated help output based on your configuration:

```console
$ deno run cli-example.ts --help
Usage: cli-example [options]

Description: this is cli-example

Options:
  --no-color    (default: color=true)
  --help        show help
  --version     <string> (required)
  --item        <string[]>
```

### Using Environment Variables

`with-help` also supports setting options via environment variables, which is particularly useful for configurations that may change between environments. In this example, `name` and `color` can be set via environment variables `OVERRIDE_NAME` and `COLOR`, respectively.

```ts
import { parseArgs } from "../parse-args.ts";

const args = parseArgs(
  Deno.args,
  {
    string: ["name"],
    boolean: ["color"],
    negatable: ["color"],
    envvar: {
      name: "OVERRIDE_NAME",            // `name` can be set by `OVERRIDE_NAME` env var
      color: "COLOR",                   // `color` can be set by `COLOR` env var
    },
  } as const,
);

console.log(`name=${args.name}, envvar=${Deno.env.get("OVERRIDE_NAME")}`);
console.log(`color=${args.color}, envvar=${Deno.env.get("COLOR")}`);
```

### Example Output with Environment Variables

Run the script with environment variables set:

```console
$ COLOR=0 OVERRIDE_NAME=bar deno run --allow-env load-envvars.ts --name foo 
name=bar, envvar=bar
color=false, envvar=0
```

Or, request help to see how environment variables are mapped:

```console
$ deno run load-envvars.ts --help
Usage: cli [options]

Options:
  --name        <string> (required)    (env: OVERRIDE_NAME)
  --no-color    (default: color=true)  (env: COLOR)
  --help        show help
```

### Summary

The `with-help` library provides a streamlined way to create a command-line interface in Deno, making it easy to set up commands, provide help messages, and support environment variable overrides. The examples demonstrate how to define options, require specific inputs, and use environment variables, offering flexibility and user-friendliness for CLI applications.