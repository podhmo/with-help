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

function formatBooleanOptions(booleans: string[], negatable: string[], required: string[]): string[] {
    return booleans.map((name) =>
        `${negatable.includes(name) ? `  --no-${name}` : `  --${name}`}${required.includes(name) ? " (required)" : ""}`
    );
}

function formatStringOptions(strings: string[], required: string[]): string[] {
    return strings.map((name) =>
        `  --${name} <string>${required.includes(name) ? " (required)" : ""}`
    );
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

    const help = [
        buildUsage(options),
        description || "",
        "Options:",
        ...formatBooleanOptions(boolean || [], negatable || [], required || []),
        ...formatStringOptions(string || [], required || []),
        // ...formatAliases(aliases),
        // ...formatDefaults(defaults),
    ];

    return help.join("\n");
}
