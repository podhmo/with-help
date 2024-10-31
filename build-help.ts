export type OriginalOptions = {
    boolean?: readonly string[];
    string?: readonly string[];
    collect?: readonly string[];
    negatable?: readonly string[];
    default?: Record<string, unknown>;

    // "--": TDoubleDash;
    // stopEarly?: boolean;
    // alias?: Record<string, string | string[]>;
    // unknown?: (name: string) => void;
}

export type MoreOptions = {
    name?: string;
    required?: readonly string[];
    description?: string;
    flagDescription?: Record<string, string>;
}

export type Options = OriginalOptions & MoreOptions;
const _negatable_padding = 3;

function formatBooleanOptions(booleans: readonly string[], negatable: readonly string[], required: readonly string[], flagDescription: Record<string, string>, maxLength: number): readonly string[] {
    return booleans.map((name) => {
        if (negatable.includes(name)) {
            const paddedName = name.padEnd(maxLength - _negatable_padding, " ");
            if (flagDescription[name] || flagDescription[`no-${name}`]) {
                return `  --no-${paddedName} ${flagDescription[name]}`;
            } else {
                return `  --no-${paddedName}${required.includes(name) ? " (required)" : ""} (default: ${name}=true)`;
            }
        } else {
            const paddedName = name.padEnd(maxLength, " ");
            if (flagDescription[name]) {
                return `  --${paddedName} ${flagDescription[name]}`;
            } else {
                return `  --${paddedName}${required.includes(name) ? " (required)" : ""} (default: ${name}=false)`;
            }
        }
    });
}

function formatStringOptions(strings: readonly string[], collectable: readonly string[], defaults: Record<string, unknown>, required: readonly string[], flagDescription: Record<string, string>, maxLength: number): readonly string[] {
    return strings.map((name) => {
        const paddedName = name.padEnd(maxLength, " ");
        if (flagDescription[name]) {
            return `  --${paddedName} <string${collectable.includes(name) ? "[]" : ""}> ${flagDescription[name]}`;
        } else if (defaults[name] !== undefined) {
            return `  --${paddedName} <string${collectable.includes(name) ? "[]" : ""}>${required.includes(name) ? " (required)" : ""} (default: ${name}=${JSON.stringify(defaults[name])})`;
        } else {
            return `  --${paddedName} <string${collectable.includes(name) ? "[]" : ""}>${required.includes(name) ? " (required)" : ""}`;
        }
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
        collect,
        default: defaults,
        required,
        description,
        flagDescription
    } = options;

    const maxLength = Math.max(
        ...(boolean || []).map((name) => name.length + ((negatable || []).includes(name) ? _negatable_padding : 0)),
        ...(string || []).map((name) => name.length),
    ) + 3;

    const help = [
        buildUsage(options),
        description ? `\nDescription: ${description}\n` : "",
        "Options:",
        ...formatBooleanOptions(boolean || [], negatable || [], required || [], flagDescription || {}, maxLength),
        ...formatStringOptions(string || [], collect || [], defaults || {}, required || [], flagDescription || {}, maxLength),
        // ...formatAliases(aliases),
        // ...formatDefaults(defaults),
    ];

    return help.join("\n");
}
