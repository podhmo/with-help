import { parseArgs as originalParseArgs } from "@std/cli/parse-args";
import { buildHelp, Options } from "./build-help.ts";


// TODO: typing improvement

export function parseArgs(
    args: string[],
    options?: Options & { unknown?: (name: string) => void },
): Record<string, string | string[] | boolean | undefined> {
    // add unknown option handler if not provided
    if (options?.unknown === undefined) {
        options = {
            ...options, unknown: (name) => {
                console.error(`Unknown option: ${name}`);
                Deno.exit(1);
            }
        };
    }

    // add help flag
    if (options.boolean === undefined || !options.boolean.includes("help")) {
        const booleans = options.boolean || [];
        booleans.push("help")

        const flagDescription = options.flagDescription || {};
        flagDescription["help"] = "show help";
        options = { ...options, boolean: booleans, flagDescription };
    }

    // add default value for boolean options
    if (options.boolean !== undefined) {
        const defaults = options.default || {};
        const negatable = options.negatable || [];
        options.boolean.forEach((name) => {
            if (defaults[name] === undefined) {
                defaults[name] = negatable.includes(name);
            }
        })
    }

    const parsed = originalParseArgs(args, options)

    // show help
    if (parsed["help"]) {
        console.log(buildHelp(options));
        Deno.exit(1)
    }

    // check required options
    options?.required?.forEach((name) => {
        if (parsed[name] === undefined) {
            console.error(`Missing required option: --${name}`);
            Deno.exit(1);
        }
    })
    return parsed as Record<string, string | string[] | boolean | undefined>;
}
