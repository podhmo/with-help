import { assertEquals } from "@std/assert"
import { buildHelp } from "./build-help.ts"


Deno.test("boolean", () => {
	const got = buildHelp({ boolean: ["verbose"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --verbose"].join("\n")
	assertEquals(got, want)
})
Deno.test("boolean,required", () => {
	const got = buildHelp({ boolean: ["verbose"], required: ["verbose"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --verbose (required)"].join("\n")
	assertEquals(got, want)
})
Deno.test("boolean,negatable", () => {
	const got = buildHelp({ boolean: ["color"], negatable: ["color"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --no-color"].join("\n")
	assertEquals(got, want)
})
Deno.test("string", () => {
	const got = buildHelp({ string: ["version"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --version <string>"].join("\n")
	assertEquals(got, want)
})
