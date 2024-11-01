# with-help

deno's [@std/cli.parseArgs()](https://jsr.io/@std/cli) with help message.

## motivation

https://github.com/nodejs/tooling/issues/19

> My original intuition here was that automated help output would be
> overreaching.

Hmm, I don't think so.

## how to use

It's almost same as jsr:@std/cli/parse-args.parseArgs().

```ts
import { parseArgs } from "jsr:@podhmo/with-help";

const flags = parseArgs(
  Deno.args,
  {
    // original options (jsr:@std/cli/parse-args)
    string: ["version", "item"],
    boolean: ["color"], // as `boolean`
    negatable: ["color"],
    collect: ["item"], // as `string[]`

    // more options
    required: ["version"], // the version's type is `string` instead of `string | undefined`
    name: "cli-example",
    description: "this is cli-example",
  } as const,
);
```

Output example is here.

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
