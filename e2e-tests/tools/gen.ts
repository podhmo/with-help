import { parseArgs } from "../../parse-args.ts";


interface TestCase {
    title: string
    options: {
        string?: [string, string][] // [name, type]
        boolean?: [string, string][] // [name, type]
        negatable?: string[]
        collect?: string[]
        required?: string[]
        default?: Record<string,unknown>
    }
}

function emitFile({ tc, code, dir }: { tc: TestCase, code: string[], dir: string }) {
    console.log(`Emitting ${tc.title}.ts`);
    Deno.writeTextFileSync(`${dir}/${tc.title}.ts`, code.join("\n"));
}


function main() {
    // todo: handling undefined correctly
    const args = parseArgs(Deno.args, {
        string: ["dir"],
        boolean: [],
        negatable: [],
        required: ["dir"],
        collect: [],
        description: "generate testdata",
    } as const)

    // success case

    const testcases: TestCase[] = [
        { title: "good-00empty", options: {} },

        { title: "good-10string1-booleanU-negatableU-collectU-requiredU", options: { string: [["name", "string | undefined"]] } },
        { title: "good-11string1-booleanU-negatableU-collectU-required0", options: { string: [["name", "string | undefined"]], required: [] } },
        { title: "good-12string1-booleanU-negatableU-collect0-required0", options: { string: [["name", "string | undefined"]], collect: [], required: [] } },
        { title: "good-13string1-booleanU-negatable0-collect0-required0", options: { string: [["name", "string | undefined"]], negatable: [], collect: [], required: [] } },
        { title: "good-14string1-boolean0-negatable0-collect0-required0", options: { string: [["name", "string | undefined"]], boolean: [], negatable: [], collect: [], required: [] } },
        { title: "good-15string1-booleanU-negatableU-collectU-required1", options: { string: [["name", "string"]], required: ["name"] } },
        { title: "good-16string1-booleanU-negatableU-collect0-required1", options: { string: [["name", "string"]], collect: [], required: ["name"] } },
        { title: "good-17string1-booleanU-negatable0-collect0-required1", options: { string: [["name", "string"]], negatable: [], collect: [], required: ["name"] } },
        { title: "good-18string1-boolean0-negatable0-collect0-required1", options: { string: [["name", "string"]], boolean: [], negatable: [], collect: [], required: ["name"] } },
        { title: "good-19string1-booleanU-negatableU-collect1-requiredU", options: { string: [["names", "string[]"]], collect: ["names"] } }, // not string[] | undefined
        { title: "good-1astring1-booleanU-negatableU-collect1-required0", options: { string: [["names", "string[]"]], collect: ["names"], required: [] } },
        { title: "good-1bstring1-booleanU-negatable0-collect1-required0", options: { string: [["names", "string[]"]], collect: ["names"], required: [], negatable: [] } },
        { title: "good-1cstring1-boolean0-negatable0-collect1-required0", options: { string: [["names", "string[]"]], collect: ["names"], required: [], boolean: [], negatable: [] } },
        { title: "good-1dstring1-booleanU-negatableU-collect1-required1", options: { string: [["names", "string[]"]], collect: ["names"], required: ["names"] } },
        { title: "good-1estring1-booleanU-negatable0-collect1-required1", options: { string: [["names", "string[]"]], collect: ["names"], required: ["names"], negatable: [] } },
        { title: "good-1fstring1-boolean0-negatable0-collect1-required1", options: { string: [["names", "string[]"]], collect: ["names"], required: ["names"], boolean: [], negatable: [] } },

        { title: "good-20stringU-boolean1-negatableU-collectU-requiredU", options: { boolean: [["color", "boolean"]] } },
        { title: "good-21stringU-boolean1-negatableU-collectU-required0", options: { boolean: [["color", "boolean"]], required: [] } },
        { title: "good-22stringU-boolean1-negatableU-collect0-required0", options: { boolean: [["color", "boolean"]], collect: [], required: [] } },
        { title: "good-23stringU-boolean1-negatable0-collect0-required0", options: { boolean: [["color", "boolean"]], negatable: [], collect: [], required: [] } },
        { title: "good-24stringU-boolean1-negatableU-collectU-required1", options: { boolean: [["color", "boolean"]], required: ["color"] } },
        { title: "good-25stringU-boolean1-negatable1-collectU-requiredU", options: { boolean: [["color", "boolean"]], negatable: ["color"] } },
        { title: "good-26string0-boolean1-negatableU-collectU-requiredU", options: { string: [], boolean: [["color", "boolean"]] } },
        { title: "good-27string0-boolean1-negatableU-collectU-required0", options: { string: [], boolean: [["color", "boolean"]], required: [] } },
        { title: "good-28string0-boolean1-negatableU-collect0-required0", options: { string: [], boolean: [["color", "boolean"]], collect: [], required: [] } },
        { title: "good-29string0-boolean1-negatable0-collect0-required0", options: { string: [], boolean: [["color", "boolean"]], negatable: [], collect: [], required: [] } },
        { title: "good-2astringU-boolean1-negatable1-collectU-requiredU", options: { boolean: [["color", "boolean"]], negatable: ["color"] } },
        { title: "good-2bstringU-boolean1-negatable1-collectU-required0", options: { boolean: [["color", "boolean"]], negatable: ["color"], required: [] } },
        { title: "good-2cstringU-boolean1-negatable1-collectU-required0", options: { boolean: [["color", "boolean"]], negatable: ["color"], required: ["color"] } },
        { title: "good-2dstring0-boolean1-negatable1-collectU-requiredU", options: { string: [], boolean: [["color", "boolean"]], negatable: ["color"] } },
        { title: "good-2estring0-boolean1-negatable1-collectU-required0", options: { string: [], boolean: [["color", "boolean"]], negatable: ["color"], required: [] } },
        { title: "good-2fstring0-boolean1-negatable1-collectU-required1", options: { string: [], boolean: [["color", "boolean"]], negatable: ["color"], required: ["color"] } },

        { title: "good-30string2-booleanU-negatableU-collectU-requiredU", options: { string: [["name", "string | undefined"], ["nickname", "string | undefined"]] } },
        { title: "good-31string2-booleanU-negatableU-collectU-required0", options: { string: [["name", "string | undefined"], ["nickname", "string | undefined"]], required: [] } },
        { title: "good-32string2-booleanU-negatableU-collectU-required1", options: { string: [["name", "string"], ["nickname", "string | undefined"]], required: ["name"] } },
        { title: "good-33string2-booleanU-negatableU-collectU-required2", options: { string: [["name", "string"], ["nickname", "string"]], required: ["name", "nickname"] } },
        { title: "good-34string2-booleanU-negatableU-collectU-requiredU-default0", options: { string: [["name", "string | undefined"], ["nickname", "string | undefined"]], default: {} } },
        { title: "good-35string2-booleanU-negatableU-collectU-requiredU-default1", options: { string: [["name", "string"], ["nickname", "string | undefined"]], default: {name: "FOO"} } },
        { title: "good-36string2-booleanU-negatableU-collectU-requiredU-default1U", options: { string: [["name", "string | undefined"], ["nickname", "string | undefined"]], default: {name: undefined} } },
    ]

    // TODO: failure case
    // - unexpected option in required (string, boolean, another)
    // - unexpected option in collect (string, boolean, another)
    // - unexpected option in string (string, boolean, another)

    for (const tc of testcases) {
        const code = [];
        code.push(`import { parseArgs } from "../parse-args.ts"`);
        code.push(`const parsed = parseArgs(Deno.args,  {`);

        if (tc.options.string) {
            code.push(`  string: ${JSON.stringify(tc.options.string.map((p => p[0])))},`);
        }
        if (tc.options.boolean) {
            code.push(`  boolean: ${JSON.stringify(tc.options.boolean)},`);
        }
        if (tc.options.negatable) {
            code.push(`  negatable: ${JSON.stringify(tc.options.negatable)},`);
        }
        if (tc.options.collect) {
            code.push(`  collect: ${JSON.stringify(tc.options.collect)},`);
        }
        if (tc.options.required) {
            code.push(`  required: ${JSON.stringify(tc.options.required)},`);
        }
        if (tc.options.default) {
            code.push(`  default: ${JSON.stringify(tc.options.default)},`);
        }

        code.push(`} as const);`);
        code.push(`const _args: string[] = parsed["_"]; // positional arguments;`);

        if (tc.options.string) {
            for (const [name, type] of tc.options.string) {
                code.push(`const _${name}: ${type} = parsed.${name};`);
            }
        }
        emitFile({ tc, code, dir: args.dir });
    }
}

if (import.meta.main) {
    main();
}

