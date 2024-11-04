import { assertEquals } from "@std/assert/equals";
import { parseArgs } from "./parse-args.ts";

// loading environment variables

class _HandlerForTest {
  env: Record<string, string> = {};

  constructor(env: Record<string, string>) {
    this.env = env;
  }
  getEnvVar = (name: string) => {
    return this.env[name];
  };
  terminate = ({ message }: { message: string; code: number }) => {
    throw new Error(message);
  };
}

Deno.test("parseArgs: loadEnv, string", () => {
  const handler = new _HandlerForTest({
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
  const handler = new _HandlerForTest({
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
      new _HandlerForTest({
        VERBOSE: "1",
      }),
    );
    assertEquals(args.verbose, true);
  }
  {
    const args = parseArgs(
      [],
      options,
      new _HandlerForTest({
        VERBOSE: "false",
      }),
    );
    assertEquals(args.verbose, false);
  }
  {
    const args = parseArgs(
      ["--verbose"],
      options,
      new _HandlerForTest({
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
      new _HandlerForTest({
        COLOR: "1",
      }),
    );
    assertEquals(args.color, true);
  }
  {
    const args = parseArgs(
      [],
      options,
      new _HandlerForTest({
        COLOR: "0",
      }),
    );
    assertEquals(args.color, false);
  }
  {
    const args = parseArgs(
      ["--no-color"],
      options,
      new _HandlerForTest({
        COLOR: "1",
      }),
    );
    assertEquals(args.color, true);
  }
  {
    const args = parseArgs(
      ["--color"],
      options,
      new _HandlerForTest({
        COLOR: "0",
      }),
    );
    assertEquals(args.color, false);
  }
});
