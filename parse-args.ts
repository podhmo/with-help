import { parseArgs as originalParseArgs } from "@std/cli/parse-args";
import { buildHelp } from "./build-help.ts";

// for enfoce as-const assertion
type EnsureLiteralArray<T> = T extends ReadonlyArray<string>
  ? string[] extends T // if T is not a literal type, return never[]
    ? never[]
  : T
  : never;

/** The return type of parseArgs(). */
type Parsed<
  StringKey extends string,
  BooleanKey extends string,
  RequiredKey extends string,
  CollectKey extends string,
  DefaultKey extends string,
> =
  & {
    [K in StringKey]: K extends CollectKey ? string[]
      : (K extends (RequiredKey | DefaultKey) ? string : (string | undefined));
  }
  & {
    [K in BooleanKey]: K extends RequiredKey ? boolean
      : (K extends DefaultKey ? boolean : boolean | undefined);
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
  StringKeys extends readonly string[],
  BooleanKeys extends readonly string[],
  RequiredKeys extends readonly string[],
  NegatableKeys extends readonly string[],
  CollectKeys extends readonly string[],
  TDefaults extends
    & { [P in EnsureLiteralArray<StringKeys>[number]]?: string | string[] }
    & { [P in EnsureLiteralArray<BooleanKeys>[number]]?: boolean },
  DefaultKey extends Extract<keyof TDefaults, string>,
  TFlagDescriptions extends
    & { [P in EnsureLiteralArray<StringKeys>[number]]?: string }
    & { [P in EnsureLiteralArray<BooleanKeys>[number]]?: string }
    & { help?: string },
>(
  args: string[],
  options: {
    // original options
    boolean?: EnsureLiteralArray<BooleanKeys>;
    string?: EnsureLiteralArray<StringKeys>;
    collect?: EnsureLiteralArray<CollectKeys>[number] extends
      EnsureLiteralArray<StringKeys>[number] ? CollectKeys
      : never;
    negatable?: EnsureLiteralArray<NegatableKeys>[number] extends
      EnsureLiteralArray<BooleanKeys>[number] ? NegatableKeys : never;
    default?: TDefaults;
    // "--": TDoubleDash;
    stopEarly?: boolean;
    alias?: Record<string, string | string[]>; // I don't like this...
    unknown?: (name: string) => void;

    // more options
    name?: string;
    required?: EnsureLiteralArray<RequiredKeys>[number] extends (
      | EnsureLiteralArray<StringKeys>[number]
      | EnsureLiteralArray<BooleanKeys>[number]
    ) ? RequiredKeys
      : never;
    description?: string;
    flagDescription?: TFlagDescriptions;

    supressHelp?: boolean;
  },
): Parsed<
  StringKeys[number],
  BooleanKeys[number],
  RequiredKeys[number],
  EnsureLiteralArray<CollectKeys>[number],
  DefaultKey
> {
  // add unknown option handler if not provided
  if (options?.unknown === undefined) {
    options = {
      ...options,
      unknown: (name) => {
        if (!options.supressHelp) {
          console.log(buildHelp(options));
          console.log("");
        }
        console.error(`Unknown option: ${name}`);
        Deno.exit(1);
      },
    };
  }

  // add help flag
  const booleans: (BooleanKeys[number] | "help")[] = options.boolean || [];
  if (!booleans.includes("help")) {
    booleans.push("help");
    const flagDescription = options.flagDescription || {} as TFlagDescriptions;
    flagDescription["help"] = "show help";
    options = {
      ...options,
      flagDescription,
      boolean: booleans as EnsureLiteralArray<BooleanKeys>,
    };
  }

  // add default value for boolean options
  if (options.boolean !== undefined) {
    const defaults = options.default || ({} as TDefaults);
    const negatable = options.negatable || [];

    options.boolean.forEach((name) => {
      if (defaults[name] === undefined) {
        // @ts-ignore Since we are looping through BooleanKeys, name will always be BooleanKeys[number] and the value is always boolean
        defaults[name] = negatable.includes(name);
      }
    });
    options = { ...options, default: defaults };
  }

  // calling the original parseArgs
  // @ts-ignore skipping it with an unknown hack because the type checking is too complex, maybe...
  //
  // error: TS2345 [ERROR]: Argument of type '{ boolean?: ("help" | EnsureLiteralArray<BooleanKeys>[number])[] | undefined; string?: EnsureLiteralArray<StringKeys> | undefined; ... 8 more ...; supressHelp?: boolean | undefined; }' is not assignable to parameter of type 'ParseOptions<"help" | EnsureLiteralArray<BooleanKeys>[number], never, string, never, TDefaults, undefined, undefined>'.
  // Types of property 'default' are incompatible.
  //   Type 'TDefaults | undefined' is not assignable to type 'undefined'.
  //     Type 'TDefaults' is not assignable to type 'undefined'.
  //       Type '{ [P in StringKeys[number]]?: string | string[] | undefined; } & { [P in BooleanKeys[number]]?: boolean | undefined; }' is not assignable to type 'undefined'.
  const parsed = originalParseArgs(args, options) as Parsed<
    StringKeys[number],
    BooleanKeys[number],
    RequiredKeys[number],
    EnsureLiteralArray<CollectKeys>[number],
    DefaultKey
  >;

  // show help
  if (parsed["help"]) {
    console.log(buildHelp(options));
    Deno.exit(1);
  }

  // check required options
  options?.required?.forEach((name) => {
    if (parsed[name as keyof typeof parsed] === undefined) {
      if (!options.supressHelp) {
        console.log(buildHelp(options));
        console.log("");
      }
      console.error(`Missing required option: --${name}`);
      Deno.exit(1);
    }
  });
  return parsed;
}
