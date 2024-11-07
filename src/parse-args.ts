import { parseArgs as originalParseArgs } from "@std/cli/parse-args";
import { buildHelp, type Options } from "./build-help.ts";

interface Handler {
  // get environment variable
  getEnvVar(name: string): string | undefined;

  // show help
  showHelp(options: Options): void;

  // exit on error
  terminate(options: { message: string; code: number }): void;
}

// default handler
const denoHandler: Handler = {
  getEnvVar(name: string): string | undefined {
    return Deno.env.get(name);
  },
  showHelp(options: Options): void {
    console.log(buildHelp(options));
    console.log("");
  },
  terminate(options: { message: string; code: number }): void {
    console.error(options.message);
    Deno.exit(options.code);
  },
};

/** The return type of parseArgs(). */
type Parsed<
  StringKey extends string,
  BooleanKey extends string,
  RequiredKey extends string,
  CollectKey extends string,
> =
  & {
    [K in StringKey]: K extends CollectKey ? string[] : (K extends RequiredKey ? string : (string | undefined));
  }
  & {
    [K in BooleanKey]: K extends RequiredKey ? boolean : boolean; // boolean | undefined is not allowed
  }
  & { help: boolean; _: string[] };

/**
 * Command line arguments parser wrapper for parseArgs of {@link https://jsr.io/@std/cli/doc/parse-args}
 *
 * The following features have been added:
 *
 * - Flags can be specified as required options (affecting the return type)
 * - Added help display by `--help`
 * - Display an error when a non-existent flag is given by typo (this is added as the default value of the unknown option)
 * - Added support for environment variables
 *
 * Also, for religious reasons, alias options are not supported very politely.
 *
 * @example
 * ```ts
 * import { parseArgs } from "jsr:@podhmo/with-help"
 *
 *  const flags = parseArgs(Deno.args, {
 *     // original options (jsr:@std/cli/parse-args)
 *     string: ["version", "item"],
 *     boolean: ["color"], // as `boolean`
 *     negatable: ["color"],
 *     collect: ["item"], // as `string[]`
 *
 *     // more options
 *     required: ["version"], // the version's type is `string` instead of `string | undefined`
 *     name: "cli-example",
 *     description: "this is cli-example",
 * } as const);
 * ```
 */
export function parseArgs<
  const StringKeys extends readonly string[],
  const BooleanKeys extends readonly string[],
  const RequiredKeys extends readonly string[],
  const NegatableKeys extends readonly string[],
  const CollectKeys extends readonly string[],
>(
  args: string[],
  options: {
    // original options
    boolean?: BooleanKeys;
    string?: StringKeys;
    collect?: CollectKeys[number] extends StringKeys[number] ? CollectKeys
      : never;
    negatable?: NegatableKeys[number] extends BooleanKeys[number] ? NegatableKeys : never;
    default?:
      & { [P in StringKeys[number]]?: string | string[] }
      & { [P in BooleanKeys[number]]?: boolean };
    // "--": TDoubleDash;
    stopEarly?: boolean;
    alias?: Record<string, string | string[]>; // I don't like this...
    unknown?: (name: string) => void;

    // more options
    name?: string;
    required?: RequiredKeys[number] extends (
      StringKeys[number] | BooleanKeys[number]
    ) ? RequiredKeys
      : never;
    description?: string;
    flagDescription?:
      & { [P in StringKeys[number]]?: string }
      & { [P in BooleanKeys[number]]?: string }
      & { help?: string };
    envvar?: { [P in StringKeys[number] | BooleanKeys[number]]?: string };

    helpText?: string; // override help text
    usageText?: string; // override usage text
    supressHelp?: boolean; // supress help message if error
  },
  // for debug or test
  handler?: Handler,
): Parsed<
  StringKeys[number],
  BooleanKeys[number],
  RequiredKeys[number],
  CollectKeys[number]
> {
  handler = handler ?? denoHandler;
  const envvar = (options.envvar ?? {}) as Record<string, string>;
  // add unknown option handler if not provided
  if (options?.unknown === undefined) {
    options = {
      ...options,
      unknown: (name) => {
        if (!name.startsWith("-")) {
          return; // skip positional arguments
        }

        if (!options.supressHelp) {
          handler.showHelp({ ...options, envvar });
        }
        handler.terminate({ message: `Unknown option: ${name}`, code: 1 });
      },
    };
  }

  // add help flag
  const booleans = (options.boolean ?? []) as (BooleanKeys[number] | "help")[];
  if (!booleans.includes("help")) {
    booleans.push("help");
    const flagDescription = (options.flagDescription ?? {}) as (typeof options.flagDescription & { "help": string });
    flagDescription["help"] = "show help";
    options = { ...options, flagDescription, boolean: booleans as unknown as typeof options.boolean }; // hack: as unknown as <type>
  }

  // add default value for boolean options
  if (options.boolean !== undefined) {
    const defaults = (options.default ?? {}) as Record<string, boolean | string | string[]>;
    const negatable = (options.negatable ?? []) as NegatableKeys;

    options.boolean.forEach((name) => {
      if (defaults[name] === undefined) {
        defaults[name] = negatable.includes(name);
      }
    });
    options = { ...options, default: defaults as unknown as typeof options.default }; // hack: as unknown as <type>
  }

  // calling the original parseArgs
  // @ts-ignore skipping it with an unknown hack because the type checking is too complex, maybe...
  //
  // [ERROR] Argument of type '{ boolean?: EnsureLiteralArray<BooleanKeys> | undefined; string?: EnsureLiteralArray<StringKeys> | undefined; ... 10 more ...; supressHelp?: boolean | undefined; }' is not assignable to parameter of type 'ParseOptions<never, never, string, string, TDefaults, Record<string, string | string[]>, undefined>'.
  // Types of property 'default' are incompatible.
  //   Type 'TDefaults | undefined' is not assignable to type 'undefined'.
  //     Type 'TDefaults' is not assignable to type 'undefined'.
  //       Type '{ [P in EnsureLiteralArray<StringKeys>[number]]?: string | string[] | undefined; } & { [P in EnsureLiteralArray<BooleanKeys>[number]]?: boolean | undefined; }' is not assignable to type 'undefined'.
  const parsed = originalParseArgs(args, options) as Parsed<
    StringKeys[number],
    BooleanKeys[number],
    RequiredKeys[number],
    CollectKeys[number]
  >;

  // show help
  if (parsed["help"]) {
    handler.showHelp({ ...options, envvar });
    handler.terminate({ message: "", code: 0 });
  }

  // loading environment variables
  if (options.envvar !== undefined) {
    for (const [name, envname] of Object.entries(envvar)) {
      if (envname !== undefined) {
        const value = handler.getEnvVar(envname) ?? "";
        if (value !== "") {
          if (booleans.includes(name)) {
            if (value === "1" || value.toUpperCase() === "TRUE") {
              // @ts-ignore name is always a key of parsed (booleans)
              parsed[name] = true;
            } else if (value === "0" || value.toUpperCase() === "FALSE") {
              // @ts-ignore name is always a key of parsed (booleans)
              parsed[name] = false;
            } else {
              console.debug(`envvar ${envname}=${value} is not boolean value, ignored`);
            }
          } else {
            if (options.collect?.includes(name)) {
              // @ts-ignore name is always a key of parsed (strings)
              parsed[name] = [value]; // support only 1 item...
            } else {
              // @ts-ignore name is always a key of parsed (strings)
              parsed[name] = value;
            }
          }
        }
      }
    }
  }

  // check required options
  options?.required?.forEach((name) => {
    if (parsed[name as keyof typeof parsed] === undefined) {
      if (!options.supressHelp) {
        handler.showHelp({ ...options, envvar });
      }
      handler.terminate({ message: `Missing required option: --${name}`, code: 1 });
    }
  });
  return parsed;
}
