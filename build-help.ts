export type OriginalOptions = {
    boolean?: string[];
    string?: string[];
    collectable?: string[];
    negatable?: string[];
    aliases?: Record<string, string | string[]>;
    defaults?: Record<string, unknown>;
}

export type MoreOptions = {
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

export function buildHelp(options: Options): string {
    const {
        boolean,
        string,
        negatable,
        // collectable,
        // aliases,
        // defaults,
        required,
        description
    } = options;

    const help = [
        description || "Usage: cli [options]",
        "",
        "Options:",
        ...formatBooleanOptions(boolean || [], negatable || [], required || []),
        ...formatStringOptions(string || [], required || []),
        // ...formatAliases(aliases),
        // ...formatDefaults(defaults),
    ];

    return help.join("\n");
}
