import { assertEquals } from "@std/assert";
import { buildHelp } from "./build-help.ts";

Deno.test("empty", () => {
  const got = buildHelp({});
  const want = ["Usage: cli [options]", "", "Options:"].join("\n");
  assertEquals(got, want);
});
Deno.test("name,description", () => {
  const got = buildHelp({
    name: "cli-example",
    description: "this is cli-example",
  });
  const want = [
    "Usage: cli-example [options]",
    "",
    "Description: this is cli-example",
    "",
    "Options:",
  ].join("\n");
  assertEquals(got, want);
});

Deno.test("boolean", () => {
  const got = buildHelp({ boolean: ["verbose"] });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --verbose    <boolean> (default: verbose=false)",
  ].join("\n");
  assertEquals(got, want);
});
Deno.test("boolean,required", () => {
  const got = buildHelp({ boolean: ["verbose"], required: ["verbose"] });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --verbose    <boolean> (required) (default: verbose=false)",
  ].join("\n");
  assertEquals(got, want);
});
Deno.test("boolean,negatable", () => {
  const got = buildHelp({ boolean: ["color"], negatable: ["color"] });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --no-color    <boolean> (default: color=true)",
  ].join("\n");
  assertEquals(got, want);
});

Deno.test("string", () => {
  const got = buildHelp({ string: ["version"] });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --version    <string>",
  ].join("\n");
  assertEquals(got, want);
});
Deno.test("string,collect", () => {
  const got = buildHelp({ string: ["item"], collect: ["item"] });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --item    <string[]>",
  ].join("\n");
  assertEquals(got, want);
});
Deno.test("string,default", () => {
  const got = buildHelp({ string: ["version"], default: { version: "0.0.0" } });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    '  --version    <string> (default: version="0.0.0")',
  ].join("\n");
  assertEquals(got, want);
});

Deno.test("boolean,flagDescription", () => {
  const got = buildHelp({
    boolean: ["help"],
    flagDescription: { help: "show help" },
  });
  const want = ["Usage: cli [options]", "", "Options:", "  --help    <boolean> show help"]
    .join("\n");
  assertEquals(got, want);
});
Deno.test("boolean,negatable,flagDescription", () => {
  const got = buildHelp({
    boolean: ["color"],
    negatable: ["color"],
    flagDescription: { "color": "without color" },
  });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --no-color    <boolean> without color",
  ].join("\n");
  assertEquals(got, want);
});
Deno.test("string,flagDescription", () => {
  const got = buildHelp({
    string: ["version"],
    required: ["version"],
    flagDescription: { "version": "set version ***required***" },
  });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --version    <string> set version ***required***",
  ].join("\n");
  assertEquals(got, want);
});
Deno.test("string,boolean,envvar", () => {
  const got = buildHelp({
    string: ["version", "config"],
    boolean: ["verbose", "color"],
    required: ["version"],
    negatable: ["color"],
    envvar: {
      version: "CLI_VERSION",
      color: "CLI_COLOR",
      verbose: "CLI_VERBOSE",
    },
  });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    "  --version     <string> (required)    (env: CLI_VERSION)",
    "  --config      <string>",
    "  --verbose     <boolean> (default: verbose=false)    (env: CLI_VERBOSE)",
    "  --no-color    <boolean> (default: color=true)    (env: CLI_COLOR)",
  ].join("\n");
  assertEquals(got, want);
});

// override text
Deno.test("override usageText", () => {
  const got = buildHelp({ boolean: ["verbose"], usageText: "cli-example [Options]" } as const);
  const want = [
    "cli-example [Options]",
    "",
    "Options:",
    "  --verbose    <boolean> (default: verbose=false)",
  ].join("\n");
  assertEquals(got, want);
});

Deno.test("override helpText", () => {
  const got = buildHelp({ boolean: ["verbose"], helpText: "this is help" });
  const want = "this is help";
  assertEquals(got, want);
});

Deno.test("header,footer", () => {
  const got = buildHelp({
    header: "header",
    footer: "footer",
  });
  const want = ["header", "Usage: cli [options]", "", "Options:", "footer"].join("\n");
  assertEquals(got, want);
});

// mask
Deno.test("mask", () => {
  const got = buildHelp({ string: ["password"], mask: ["password"], default: { password: "xxx" } });
  const want = [
    "Usage: cli [options]",
    "",
    "Options:",
    `  --password    <string> (default: password="***")`,
  ].join("\n");
  assertEquals(got, want);
});
