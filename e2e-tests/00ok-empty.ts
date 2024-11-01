import { parseArgs } from "../parse-args.ts"
const parsed = parseArgs(Deno.args,  {
});
const _args: string[] = parsed["_"]; // positional arguments;