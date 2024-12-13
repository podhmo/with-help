import { parseArgs as originalParseArgs } from "@std/cli/parse-args";
import { buildHelp, type Options } from "./build-help.ts";
import type { ExtractLiteralUnion } from "./types.ts";

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
    [K in BooleanKey]: boolean; // boolean | undefined is not allowed
  }
  & { help: boolean; _: string[] }
  & HasCallback;

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
 *     // additional options
 *     required: ["version"], // the version's type is `string` instead of `string | undefined`
 *     name: "cli-example",
 *     description: "this is cli-example",
 * });
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
    collect?: ExtractLiteralUnion<CollectKeys> extends ExtractLiteralUnion<StringKeys> ? CollectKeys : ExtractLiteralUnion<StringKeys>[];
    negatable?: ExtractLiteralUnion<NegatableKeys> extends ExtractLiteralUnion<BooleanKeys> ? NegatableKeys : ExtractLiteralUnion<BooleanKeys>[];
    default?:
      & { [P in ExtractLiteralUnion<StringKeys>]?: string | string[] }
      & { [P in ExtractLiteralUnion<BooleanKeys>]?: boolean };
    "--"?: boolean;
    stopEarly?: boolean;
    alias?: Record<string, string | string[]>; // I don't like this...
    unknown?: (name: string) => void;

    // additional options
    name?: string;
    required?: ExtractLiteralUnion<RequiredKeys> extends ExtractLiteralUnion<StringKeys> ? RequiredKeys : ExtractLiteralUnion<StringKeys>[];
    mask?: ExtractLiteralUnion<RequiredKeys> extends ExtractLiteralUnion<StringKeys> ? RequiredKeys : ExtractLiteralUnion<StringKeys>[];
    description?: string;
    flagDescription?:
      & { [P in ExtractLiteralUnion<StringKeys> | ExtractLiteralUnion<BooleanKeys>]?: string }
      & { help?: string };
    envvar?: { [P in ExtractLiteralUnion<StringKeys> | ExtractLiteralUnion<BooleanKeys>]?: string };

    helpText?: string; // override help text
    usageText?: string; // override usage text

    supressHelp?: boolean; // supress help message if error

    header?: string; // header text
    footer?: string; // footer text
  },
  // for debug or test
  handler?: Handler,
): Parsed<
  ExtractLiteralUnion<StringKeys>,
  ExtractLiteralUnion<BooleanKeys>,
  ExtractLiteralUnion<RequiredKeys>,
  ExtractLiteralUnion<CollectKeys>
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

  const defaults = (options.default ?? {}) as Record<string, boolean | string | string[]>;
  // add default value for boolean options
  if (options.boolean !== undefined) {
    const negatable = (options.negatable ?? []) as NegatableKeys;

    options.boolean.forEach((name) => {
      if (defaults[name] === undefined) {
        defaults[name] = negatable.includes(name);
      }
    });
  }

  // loading environment variables
  if (options.envvar !== undefined) {
    for (const [name, envname] of Object.entries(envvar)) {
      if (envname === undefined) {
        continue;
      }

      const value = handler.getEnvVar(envname) ?? "";
      if (value !== "") {
        if (booleans.includes(name)) {
          if (value === "1" || value.toUpperCase() === "TRUE") {
            defaults[name] = true;
          } else if (value === "0" || value.toUpperCase() === "FALSE") {
            defaults[name] = false;
          } else {
            console.debug(`envvar ${envname}=${value} is not boolean value, ignored`);
          }
        } else {
          if (options.collect?.includes(name as ExtractLiteralUnion<StringKeys>)) {
            defaults[name] = [value]; // support only 1 item...
          } else {
            defaults[name] = value;
          }
        }
      }
    }
  }
  options = { ...options, default: defaults as unknown as typeof options.default }; // hack: as unknown as <type>

  // calling original parseArgs
  const parsed = originalParseArgs(args, options) as unknown as Parsed<
    // hack: as unknown as <type>
    ExtractLiteralUnion<StringKeys>,
    ExtractLiteralUnion<BooleanKeys>,
    ExtractLiteralUnion<RequiredKeys>,
    ExtractLiteralUnion<CollectKeys>
  >;

  // show help
  if (parsed.help) {
    handler.showHelp({ ...options, envvar });
    handler.terminate({ message: "", code: 0 });
  }

  // check required options
  if (!(options.stopEarly && (parsed._.length === 0 || parsed._.includes("--help")))) { // skip if --help is given in rest arguments
    options?.required?.forEach((name) => {
      if (parsed[name as keyof typeof parsed] === undefined) {
        if (!options.supressHelp) {
          handler.showHelp({ ...options, envvar });
        }
        handler.terminate({ message: `Missing required option: --${name}`, code: 1 });
      }
    });
  }

  return {
    ...parsed,

    // this is hacky way to inject restriction
    [injectCallbackSymbol]: (reaciton: (options: Options, suppressHelp: boolean, handler: Handler) => void) => {
      reaciton({ ...options, envvar: options.envvar as Record<string, string> }, options.supressHelp ?? false, handler);
    },
  };
}

const injectCallbackSymbol = Symbol("callback for something");

interface HasCallback {
  [injectCallbackSymbol]: (reaction: (options: Options, suppressHelp: boolean, handler: Handler) => void) => void;
}

/** Restriction class for type checking */
export class Restriction {
  constructor(
    private readonly options: Options,
    private readonly supressHelp: boolean = false, // supress help message if error
    private readonly _handler: Handler = denoHandler,
  ) {}

  /** Check if the value is one of the candidates */
  choices = <const KS extends readonly string[]>(value: string, candidates: KS): string[] extends KS ? never : KS[number] => {
    if (!candidates.includes(value)) {
      if (!this.supressHelp) {
        this._handler.showHelp(this.options);
      }
      this._handler.terminate({ message: `"${value}" is not one of ${JSON.stringify(candidates)}`, code: 1 });
    }
    return value as string[] extends KS ? never : KS[number];
  };

  /** Check if the value is a float */
  float = (value: string): number => {
    // e.g. -1.0, 1., .1, +1
    if (!/^[+\-]?(\d*\.\d+|\d+\.?\d*)$/.test(value.trim())) {
      if (!this.supressHelp) {
        this._handler.showHelp(this.options);
      }
      this._handler.terminate({ message: `"${value}" is not a float`, code: 1 });
    }
    return parseFloat(value);
  };

  /** Check if the value is an integer */
  integer = (value: string): number => {
    // e.g. -1, 1, +1
    if (!/^[+\-]?\d+$/.test(value.trim())) {
      if (!this.supressHelp) {
        this._handler.showHelp(this.options);
      }
      this._handler.terminate({ message: `"${value}" is not an integer`, code: 1 });
    }
    return parseInt(value, 10);
  };
}

/** Get restriction object for more strict typing */
export function moreStrict(parsed: HasCallback): Restriction {
  let restriction: Restriction | undefined;
  parsed[injectCallbackSymbol]((options, suppressHelp, handler) => {
    restriction = new Restriction(options, suppressHelp, handler);
  });
  return restriction as Restriction;
}

export function printHelp(parsed: HasCallback): void {
  parsed[injectCallbackSymbol]((options, _, handler) => {
    handler.showHelp(options);
  });
}
