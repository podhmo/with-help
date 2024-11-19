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

    // additional options
    required: ["version"], // the version's type is `string` instead of `string | undefined`
    name: "cli-example",
    description: "this is cli-example",
  },
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

### with environment variables

```ts
import { parseArgs } from "../parse-args.ts";

const args = parseArgs(
  Deno.args,
  {
    string: ["name"],
    boolean: ["color"],
    negatable: ["color"],
    envvar: {
      name: "OVERRIDE_NAME",
      color: "COLOR", // if COLOR=1 set args.color=true, if COLOR=0 set args.color=false
    },
  },
);

console.log(`name=${args.name}, envvar=${Deno.env.get("OVERRIDE_NAME")}`);
console.log(`color=${args.color}, envvar=${Deno.env.get("COLOR")}`);
```

Output example is here.

```console
$ COLOR=0 OVERRIDE_NAME=bar deno run --allow-env load-envvars.ts --name foo 
name=bar, envvar=bar
color=false, envvar=0

$ deno run load-envvars.ts --help
Usage: cli [options]

Options:
  --name        <string> (required)    (env: OVERRIDE_NAME)
  --no-color    (default: color=true)    (env: COLOR)
  --help        show help
```
