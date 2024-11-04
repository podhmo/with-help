import { assertEquals } from "@std/assert/equals";
import { parseArgs } from "./parse-args.ts";

class _TerminateError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

class _FakeGetEnvHandler {
  env: Record<string, string> = {};

  constructor(env: Record<string, string>) {
    this.env = env;
  }
  getEnvVar = (name: string) => {
    return this.env[name];
  };
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
    assertEquals(args.name, "bar");
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
    assertEquals(args.item, ["x"]);
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
    const args = parseArgs(
      [],
      options,
      new _FakeGetEnvHandler({
        VERBOSE: "1",
      }),
    );
    assertEquals(args.verbose, true);
  }
  {
    const args = parseArgs(
      [],
      options,
      new _FakeGetEnvHandler({
        VERBOSE: "false",
      }),
    );
    assertEquals(args.verbose, false);
  }
  {
    const args = parseArgs(
      ["--verbose"],
      options,
      new _FakeGetEnvHandler({
        VERBOSE: "true",
      }),
    );
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
    const args = parseArgs(
      [],
      options,
      new _FakeGetEnvHandler({
        COLOR: "1",
      }),
    );
    assertEquals(args.color, true);
  }
  {
    const args = parseArgs(
      [],
      options,
      new _FakeGetEnvHandler({
        COLOR: "0",
      }),
    );
    assertEquals(args.color, false);
  }
  {
    const args = parseArgs(
      ["--no-color"],
      options,
      new _FakeGetEnvHandler({
        COLOR: "1",
      }),
    );
    assertEquals(args.color, true);
  }
  {
    const args = parseArgs(
      ["--color"],
      options,
      new _FakeGetEnvHandler({
        COLOR: "0",
      }),
    );
    assertEquals(args.color, false);
  }
});
