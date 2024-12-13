import { assertEquals } from "@std/assert/equals";
import { assertFalse } from "@std/assert/false";

import { moreStrict, parseArgs } from "./parse-args.ts";
import type { Options } from "./build-help.ts";

class _TerminateError extends Error {
  constructor(message: string, public code: number) {
    super(message);
  }
}

class _FakeGetEnvHandler {
  env: Record<string, string> = {};

  constructor(env: Record<string, string>) {
    this.env = env;
  }

  getEnvVar = (name: string) => this.env[name];
  showHelp = (_: Options) => {};
  terminate = (ctx: { message: string; code: number }) => {
    throw new _TerminateError(ctx.message, ctx.code);
  };
}

// strings
Deno.test("parseArgs: strings", () => {
  const options = {
    string: ["name"],
  } as const;
  const handler = new _FakeGetEnvHandler({});

  {
    const args = parseArgs(["--name", "foo"], options, handler);
    assertEquals(args.name, "foo");
  }
  {
    const args = parseArgs([], options, handler);
    assertEquals(args.name, undefined);
  }
});
Deno.test("parseArgs: strings with collect", () => {
  const options = {
    string: ["item"],
    collect: ["item"],
  } as const;
  const handler = new _FakeGetEnvHandler({});

  {
    const args = parseArgs(["--item", "a", "--item", "b"], options, handler);
    assertEquals(args.item, ["a", "b"]);
  }
  {
    const args = parseArgs([], options, handler);
    assertEquals(args.item, []);
  }
});

// booleans
Deno.test("parseArgs: booleans", () => {
  const options = {
    boolean: ["verbose"],
  } as const;
  const handler = new _FakeGetEnvHandler({});

  {
    const args = parseArgs(["--verbose"], options, handler);
    assertEquals(args.verbose, true);
  }
  {
    const args = parseArgs([], options, handler);
    assertEquals(args.verbose, false);
  }
  {
    try {
      const args = parseArgs(["--no-verbose"], options, handler);
      assertEquals(args.verbose, false);
    } catch (e) {
      assertEquals(e instanceof _TerminateError, true);
      assertEquals(
        (e as _TerminateError).message,
        "Unknown option: --no-verbose",
      );
    }
  }
});
Deno.test("parseArgs: booleans with negatable", () => {
  const options = {
    boolean: ["color"],
    negatable: ["color"],
  } as const;
  const handler = new _FakeGetEnvHandler({});

  {
    const args = parseArgs(["--color"], options, handler);
    assertEquals(args.color, true);
  }
  {
    const args = parseArgs(["--no-color"], options, handler);
    assertEquals(args.color, false);
  }
  {
    const args = parseArgs([], options, handler);
    assertEquals(args.color, true);
  }
});

// required

Deno.test("parseArgs: required", () => {
  const options = {
    string: ["name"],
    required: ["name"],
  } as const;
  const handler = new _FakeGetEnvHandler({});

  {
    const args = parseArgs(["--name", "foo"], options, handler);
    assertEquals(args.name, "foo");
  }

  try {
    parseArgs([], options, handler);
  } catch (e: unknown) {
    assertEquals(e instanceof _TerminateError, true);
    assertEquals(
      (e as _TerminateError).message,
      "Missing required option: --name",
    );
  }
});
Deno.test("parseArgs: required with default", () => {
  const options = {
    string: ["name"],
    required: ["name"],
    default: {
      name: "default-name",
    },
  } as const;
  const handler = new _FakeGetEnvHandler({});

  {
    const args = parseArgs(["--name", "foo"], options, handler);
    assertEquals(args.name, "foo");
  }

  {
    const args = parseArgs([], options, handler);
    assertEquals(args.name, "default-name");
  }
});

// loading environment variables

Deno.test("parseArgs: loadEnv, string", () => {
  const handler = new _FakeGetEnvHandler({
    OVERRIDE_NAME: "bar",
  });
  const options = {
    string: ["name"],
    envvar: {
      name: "OVERRIDE_NAME",
    },
  } as const;

  {
    const args = parseArgs([], options, handler);
    assertEquals(args.name, "bar");
  }
  {
    const args = parseArgs(["--name", "foo"], options, handler);
    assertEquals(args.name, "foo");
  }
});

Deno.test("parseArgs: loadEnv, string with collect", () => {
  const handler = new _FakeGetEnvHandler({
    ITEM: "x",
  });
  const options = {
    string: ["item"],
    collect: ["item"],
    envvar: {
      item: "ITEM",
    },
  } as const;

  {
    const args = parseArgs([], options, handler);
    assertEquals(args.item, ["x"]);
  }
  {
    const args = parseArgs(["--item", "a", "--item", "b"], options, handler);
    assertEquals(args.item, ["a", "b"]);
  }
});

Deno.test("parseArgs: loadEnv, boolean", () => {
  const options = {
    boolean: ["verbose"],
    envvar: {
      verbose: "VERBOSE",
    },
  } as const;

  {
    const args = parseArgs([], options, new _FakeGetEnvHandler({ VERBOSE: "1" }));
    assertEquals(args.verbose, true);
  }
  {
    const args = parseArgs([], options, new _FakeGetEnvHandler({ VERBOSE: "false" }));
    assertEquals(args.verbose, false);
  }
  {
    const args = parseArgs(["--verbose"], options, new _FakeGetEnvHandler({ VERBOSE: "true" }));
    assertEquals(args.verbose, true);
  }
});
Deno.test("parseArgs: loadEnv, boolean with negatable", () => {
  const options = {
    boolean: ["color"],
    negatable: ["color"],
    envvar: {
      color: "COLOR",
    },
  } as const;

  {
    const args = parseArgs([], options, new _FakeGetEnvHandler({ COLOR: "1" }));
    assertEquals(args.color, true);
  }
  {
    const args = parseArgs([], options, new _FakeGetEnvHandler({ COLOR: "0" }));
    assertEquals(args.color, false);
  }
  {
    const args = parseArgs(["--no-color"], options, new _FakeGetEnvHandler({ COLOR: "1" }));
    assertEquals(args.color, false);
  }
  {
    const args = parseArgs(["--color"], options, new _FakeGetEnvHandler({ COLOR: "0" }));
    assertEquals(args.color, true);
  }
});

// for subcommands

Deno.test("parseArgs: skip required check if subcommands's --help is given", () => {
  const options = {
    name: "subcommand-example",
    string: ["apiKey"],
    required: ["apiKey"],
    stopEarly: true,
  } as const;

  const handler = new _FakeGetEnvHandler({});
  { // without --help
    try {
      parseArgs([], options, handler);
    } catch (e: unknown) {
      assertEquals(e instanceof _TerminateError, true);
      assertEquals(
        (e as _TerminateError).message,
        "Missing required option: --apiKey",
      );
    }
  }

  { // with --help
    const args = parseArgs(["foo", "--help"], options, handler);
    assertEquals(args._, ["foo", "--help"]);
  }
});

// for more strict type checking
Deno.test("parseArgs: strict type checking, choices", () => {
  const abc = ["a", "b", "c"] as const;
  const options = {
    name: "subcommand-example",
    string: ["value"],
    required: ["value"],
  } as const;

  const handler = new _FakeGetEnvHandler({});

  { // ok
    const args = parseArgs(["--value", "a"], options, handler);
    const coerce = moreStrict(args).choices;
    const args_ = { ...args, value: coerce(args.value, abc) };

    // @ts-expect-error "d" is not in "a" | "b" | "c"
    assertFalse(args_.value === "d");
  }

  { // passing invalid value
    const args = parseArgs(["--value", "d"], options, handler);
    const coerce = moreStrict(args).choices;
    try {
      const _ = { ...args, value: coerce(args.value, abc) };
    } catch (e: unknown) {
      assertEquals(e instanceof _TerminateError, true);
      assertEquals(
        (e as _TerminateError).message,
        `"d" is not one of ["a","b","c"]`,
      );
    }
  }
});
Deno.test("parseArgs: strict type checking, integer", () => {
  const options = {
    name: "subcommand-example",
    string: ["value"],
    required: ["value"],
  } as const;

  const handler = new _FakeGetEnvHandler({});

  { // ok
    const args = parseArgs(["--value", "123"], options, handler);
    const coerce = moreStrict(args).integer;
    const args_ = { ...args, value: coerce(args.value) };

    // @ts-expect-error "foo" is not an integer
    assertFalse(args_.value === "foo");
  }

  { // passing invalid value
    const args = parseArgs(["--value", "xxx"], options, handler);
    const coerce = moreStrict(args).integer;

    try {
      const _ = { ...args, value: coerce(args.value) };
    } catch (e: unknown) {
      assertEquals(e instanceof _TerminateError, true);
      assertEquals(
        (e as _TerminateError).message,
        `"xxx" is not an integer`,
      );
    }
  }
});
Deno.test("parseArgs: strict type checking, float", () => {
  const options = {
    name: "subcommand-example",
    string: ["value"],
    required: ["value"],
  } as const;

  const handler = new _FakeGetEnvHandler({});

  { // ok
    const args = parseArgs(["--value", "123"], options, handler);
    const coerce = moreStrict(args).float;
    const args_ = { ...args, value: coerce(args.value) };

    // @ts-expect-error "foo" is not a float
    assertFalse(args_.value === "foo");
  }

  { // passing invalid value
    const args = parseArgs(["--value", "xxx"], options, handler);
    const coerce = moreStrict(args).float;

    try {
      const _ = { ...args, value: coerce(args.value) };
    } catch (e: unknown) {
      assertEquals(e instanceof _TerminateError, true);
      assertEquals(
        (e as _TerminateError).message,
        `"xxx" is not a float`,
      );
    }
  }
});
