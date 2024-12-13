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

  /** Environment variables to use for options. */
  envvar?: Record<string, string>;

  /** Help text (overwrite) */
  helpText?: string;

  /** Usage text (overwrite) */
  usageText?: string;

  /** Header text to display before the options. */
  header?: string;

  /** Footer text to display after the options. */
  footer?: string;
};

/** Combined options including both OriginalOptions and MoreOptions. */
export type Options = OriginalOptions & MoreOptions;

const _negatable_padding = 3; // for "--no-" prefix

function formatBooleanOptions(
  booleans: readonly string[],
  negatable: readonly string[],
  required: readonly string[],
  flagDescription: Record<string, string>,
  envvar: Record<string, string>,
  maxLength: number,
): readonly string[] {
  return booleans.map((name) => {
    const output = [];
    if (negatable.includes(name)) {
      const paddedName = name.padEnd(maxLength - _negatable_padding, " ");
      if (flagDescription[name] || flagDescription[`no-${name}`]) {
        output.push(`  --no-${paddedName} <boolean> ${flagDescription[name]}`);
      } else {
        output.push(`  --no-${paddedName} <boolean>${required.includes(name) ? " (required)" : ""} (default: ${name}=true)`);
      }
    } else {
      const paddedName = name.padEnd(maxLength, " ");
      if (flagDescription[name]) {
        output.push(`  --${paddedName} <boolean> ${flagDescription[name]}`);
      } else {
        output.push(`  --${paddedName} <boolean>${required.includes(name) ? " (required)" : ""} (default: ${name}=false)`);
      }
    }
    if (envvar[name]) {
      output.push(`    (env: ${envvar[name]})`);
    }
    return output.join("");
  });
}

function formatStringOptions(
  strings: readonly string[],
  collectable: readonly string[],
  defaults: Record<string, unknown>,
  required: readonly string[],
  flagDescription: Record<string, string>,
  envvar: Record<string, string>,
  maxLength: number,
): readonly string[] {
  return strings.map((name) => {
    const output = [];
    const paddedName = name.padEnd(maxLength, " ");
    if (flagDescription[name]) {
      output.push(
        `  --${paddedName} <string${collectable.includes(name) ? "[]" : ""}> ${flagDescription[name]}`,
      );
    } else if (defaults[name] !== undefined) {
      output.push(
        `  --${paddedName} <string${collectable.includes(name) ? "[]" : ""}>${required.includes(name) ? " (required)" : ""} (default: ${name}=${JSON.stringify(defaults[name])})`,
      );
    } else {
      output.push(
        `  --${paddedName} <string${collectable.includes(name) ? "[]" : ""}>${required.includes(name) ? " (required)" : ""}`,
      );
    }
    if (envvar[name]) {
      output.push(`    (env: ${envvar[name]})`);
    }
    return output.join("");
  });
}

/** Builds a usage message from the provided options. */
export function buildUsage({ name, usageText }: Options): string {
  if (usageText) {
    return usageText;
  }
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
    envvar,
  } = options;

  if (options.helpText) {
    return options.helpText;
  }

  const maxLength = Math.max(
    ...(boolean || []).map((name) => name.length + ((negatable || []).includes(name) ? _negatable_padding : 0)),
    ...(string || []).map((name) => name.length),
  ) + 3;

  const help = [
    buildUsage(options),
    description ? `\nDescription: ${description}\n` : "",
    "Options:",
    ...formatStringOptions(
      string || [],
      collect || [],
      defaults || {},
      required || [],
      flagDescription || {},
      envvar || {},
      maxLength,
    ),
    ...formatBooleanOptions(
      boolean || [],
      negatable || [],
      required || [],
      flagDescription || {},
      envvar || {},
      maxLength,
    ),
  ];

  if (options.header) {
    help.unshift(options.header);
  }
  if (options.footer) {
    help.push(options.footer);
  }
  return help.join("\n");
}
