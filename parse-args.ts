import { parseArgs as originalParseArgs } from "@std/cli/parse-args";
import { buildHelp } from "./build-help.ts";

// for enfoce as-const assertion
type EnsureLiteralArray<T> = T extends ReadonlyArray<string>
    ? string[] extends T // if T is not a literal type, return never[]
    ? never[]
    : T
    : never;


type Parsed<
    StringKey extends string,
    BooleanKey extends string,
    RequiredKey extends string,
    CollectKey extends string,
    DefaultKey extends string
> = {
    [K in StringKey]:
    K extends CollectKey
    ? string[]
    : (K extends (RequiredKey | DefaultKey) ? string : (string | undefined))
} &
    {
        [K in BooleanKey]: K extends RequiredKey
        ? boolean
        : (K extends DefaultKey ? boolean : boolean | undefined);
    } & { help: boolean; _: string[]; };


export function parseArgs<
    StringKeys extends readonly string[],
    BooleanKeys extends readonly string[],
    RequiredKeys extends readonly string[],
    CollectKeys extends readonly string[],
    TDefaults extends { [P in StringKeys[number]]?: string | string[] } & { [P in BooleanKeys[number]]?: boolean },
    DefaultKey extends Extract<keyof TDefaults, string>,
    TFlagDescriptions extends { [P in StringKeys[number]]?: string } & { [P in BooleanKeys[number]]?: string } & { help?: string },
>(
    args: string[],
    options: {
        // original options
        boolean?: (EnsureLiteralArray<BooleanKeys>[number] | "help")[];
        string?: EnsureLiteralArray<StringKeys>;
        collect?: EnsureLiteralArray<CollectKeys>[number] extends StringKeys[number] ? CollectKeys : never;
        negatable?: EnsureLiteralArray<BooleanKeys>;
        default?: TDefaults
        // "--": TDoubleDash;
        // stopEarly?: boolean;
        // alias?: Record<string, string | string[]>;
        unknown?: (name: string) => void

        // more options
        name?: string;
        required?: EnsureLiteralArray<RequiredKeys[number] extends (StringKeys[number] | BooleanKeys[number]) ? RequiredKeys : never>;
        description?: string;
        flagDescription?: TFlagDescriptions;

        supressHelp?: boolean;
    }
): Parsed<StringKeys[number], BooleanKeys[number], RequiredKeys[number], CollectKeys[number], DefaultKey> {
    // add unknown option handler if not provided
    if (options?.unknown === undefined) {
        options = {
            ...options, unknown: (name) => {
                if (!options.supressHelp) {
                    console.log(buildHelp(options));
                    console.log("");
                }
                console.error(`Unknown option: ${name}`);
                Deno.exit(1);
            }
        };
    }

    // add help flag
    if (options.boolean === undefined || !options.boolean.includes("help")) {
        const booleans = options.boolean || [];
        booleans.push("help")

        const flagDescription: TFlagDescriptions = options.flagDescription || ({} as TFlagDescriptions);
        flagDescription["help"] = "show help";
        options = { ...options, boolean: booleans, flagDescription };
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
        })
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
    const parsed = originalParseArgs(args, options) as Parsed<StringKeys[number], BooleanKeys[number], RequiredKeys[number], CollectKeys[number], DefaultKey>;

    // show help
    if (parsed["help"]) {
        console.log(buildHelp(options));
        Deno.exit(1)
    }

    // check required options
    options?.required?.forEach((name) => {
        if (parsed[name] === undefined) {
            if (!options.supressHelp) {
                console.log(buildHelp(options));
                console.log("");
            }
            console.error(`Missing required option: --${name}`);
            Deno.exit(1);
        }
    })
    return parsed
}
