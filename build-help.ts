/**
 * Provides a function to build a help message from command-line options.
 */

/** Options available from the @std/ci/parse-args library. */
export type OriginalOptions = {
  /** Boolean options (flags). */
  boolean?: readonly string[];

  /** String options. (flags). */
  string?: readonly string[];

  /** Options that support multiple values. */
  collect?: readonly string[];

  /** Options that can have negatable values (e.g., "--no-option"). */
  negatable?: readonly string[];

  /** Default values for options. */
  default?: Record<string, unknown>;
  // // Uncomment the following properties if needed
  // "--": TDoubleDash;
  // stopEarly?: boolean;
  // alias?: Record<string, string | string[]>;
  // unknown?: (name: string) => void;
};

/** Additional options added by this package. */
export type MoreOptions = {
  /** The name of the CLI tool or command. */
  name?: string;

  /** Options that are required. */
  required?: readonly string[];

  /** A general description of the CLI tool. */
  description?: string;

  /** Descriptions for specific flags. */
  flagDescription?: Record<string, string>;
};

/** Combined options including both OriginalOptions and MoreOptions. */
export type Options = OriginalOptions & MoreOptions;

const _negatable_padding = 3; // for "--no-" prefix

function formatBooleanOptions(
  booleans: readonly string[],
  negatable: readonly string[],
  required: readonly string[],
  flagDescription: Record<string, string>,
  maxLength: number,
): readonly string[] {
  return booleans.map((name) => {
    if (negatable.includes(name)) {
      const paddedName = name.padEnd(maxLength - _negatable_padding, " ");
      if (flagDescription[name] || flagDescription[`no-${name}`]) {
        return `  --no-${paddedName} ${flagDescription[name]}`;
      } else {
        return `  --no-${paddedName}${
          required.includes(name) ? " (required)" : ""
        } (default: ${name}=true)`;
      }
    } else {
      const paddedName = name.padEnd(maxLength, " ");
      if (flagDescription[name]) {
        return `  --${paddedName} ${flagDescription[name]}`;
      } else {
        return `  --${paddedName}${
          required.includes(name) ? " (required)" : ""
        } (default: ${name}=false)`;
      }
    }
  });
}

function formatStringOptions(
  strings: readonly string[],
  collectable: readonly string[],
  defaults: Record<string, unknown>,
  required: readonly string[],
  flagDescription: Record<string, string>,
  maxLength: number,
): readonly string[] {
  return strings.map((name) => {
    const paddedName = name.padEnd(maxLength, " ");
    if (flagDescription[name]) {
      return `  --${paddedName} <string${
        collectable.includes(name) ? "[]" : ""
      }> ${flagDescription[name]}`;
    } else if (defaults[name] !== undefined) {
      return `  --${paddedName} <string${
        collectable.includes(name) ? "[]" : ""
      }>${required.includes(name) ? " (required)" : ""} (default: ${name}=${
        JSON.stringify(defaults[name])
      })`;
    } else {
      return `  --${paddedName} <string${
        collectable.includes(name) ? "[]" : ""
      }>${required.includes(name) ? " (required)" : ""}`;
    }
  });
}

function buildUsage({ name }: Options): string {
  return `Usage: ${name || "cli"} [options]`;
}

/** Builds a complete help message from the provided options. */
export function buildHelp(options: Options): string {
  const {
    boolean,
    string,
    negatable,
    collect,
    default: defaults,
    required,
    description,
    flagDescription,
  } = options;

  const maxLength = Math.max(
    ...(boolean || []).map((name) =>
      name.length + ((negatable || []).includes(name) ? _negatable_padding : 0)
    ),
    ...(string || []).map((name) => name.length),
  ) + 3;

  const help = [
    buildUsage(options),
    description ? `\nDescription: ${description}\n` : "",
    "Options:",
    ...formatBooleanOptions(
      boolean || [],
      negatable || [],
      required || [],
      flagDescription || {},
      maxLength,
    ),
    ...formatStringOptions(
      string || [],
      collect || [],
      defaults || {},
      required || [],
      flagDescription || {},
      maxLength,
    ),
    // ...formatAliases(aliases),
    // ...formatDefaults(defaults),
  ];

  return help.join("\n");
}
