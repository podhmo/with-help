// generate testdata

import { parseArgs } from "../parse-args.ts";


interface TestCase {
    title: string
    options: { [P in "string" | "boolean"]?: unknown }
}

function emitFile({ tc, code, dir }: { tc: TestCase, code: string[], dir: string }) {
    console.log(`Emitting ${tc.title}.ts`);
    Deno.writeTextFileSync(`${dir}/${tc.title}.ts`, code.join("\n"));
}


function main() {
    const args = parseArgs(Deno.args, {
        string: ["dir"],
        boolean: [],
        negatable: [],
        required: ["dir"],
        collect: [],
    } as const)

    const testcases: TestCase[] = [
        { title: "00ok-empty", options: {} }
    ]

    for (const tc of testcases) {
        const code = [];
        code.push(`import { parseArgs } from "../parse-args.ts"`);
        code.push(`const parsed = parseArgs(Deno.args,  {`);
        code.push(`});`);
        code.push(`const _args: string[] = parsed["_"]; // positional arguments;`);

        emitFile({ tc, code, dir: args.dir });
    }
}

if (import.meta.main) {
    main();
}

