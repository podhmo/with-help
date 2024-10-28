export type OriginalOptions = {
    boolean?: string[];
    string?: string[];
    collect?: string[];
    negatable?: string[];
    default?: Record<string, unknown>;

    // "--": TDoubleDash;
    // stopEarly?: boolean;
    // alias?: Record<string, string | string[]>;
    // unknown?: (name: string) => void;
}

export type MoreOptions = {
    name?: string;
    required?: string[];
    description?: string;
}

type Options = OriginalOptions & MoreOptions;
const _negatable_padding = 3;

function formatBooleanOptions(booleans: string[], negatable: string[], required: string[], maxLength: number): string[] {
    return booleans.map((name) => {
        if (negatable.includes(name)) {
            const paddedName = name.padEnd(maxLength - _negatable_padding, " ");
            return `  --no-${paddedName}${required.includes(name) ? " (required)" : ""} (default: ${name}=true)`;
        } else {
            const paddedName = name.padEnd(maxLength, " ");
            return `  --${paddedName}${required.includes(name) ? " (required)" : ""} (default: ${name}=false)`;
        }
    });
}

function formatStringOptions(strings: string[], required: string[], maxLength: number): string[] {
    return strings.map((name) => {
        const paddedName = name.padEnd(maxLength, " ");
        return `  --${paddedName} <string>${required.includes(name) ? " (required)" : ""}`;

    });
}

function buildUsage({ name }: Options): string {
    return `Usage: ${name || "cli"} [options]`
}

export function buildHelp(options: Options): string {
    const {
        boolean,
        string,
        negatable,
        required,
        description
    } = options;

    const maxLength = Math.max(
        ...(boolean || []).map((name) => name.length + ((negatable || []).includes(name) ? _negatable_padding : 0)),
        ...(string || []).map((name) => name.length),
    )+ 3;

    const help = [
        buildUsage(options),
        description || "",
        "Options:",
        ...formatBooleanOptions(boolean || [], negatable || [], required || [], maxLength),
        ...formatStringOptions(string || [], required || [], maxLength),
        // ...formatAliases(aliases),
        // ...formatDefaults(defaults),
    ];

    return help.join("\n");
}
