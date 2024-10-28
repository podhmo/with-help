import { assertEquals } from "@std/assert"
import { buildHelp } from "./build-help.ts"

Deno.test("empty", () => {
	const got = buildHelp({})
	const want = ["Usage: cli [options]", "", "Options:"].join("\n")
	assertEquals(got, want)
})
Deno.test("name,description", () => {
	const got = buildHelp({ name: "cli-example", description: "this is cli-example" })
	const want = ["Usage: cli-example [options]", "", "Description: this is cli-example", "", "Options:"].join("\n")
	assertEquals(got, want)
})

Deno.test("boolean", () => {
	const got = buildHelp({ boolean: ["verbose"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --verbose    (default: verbose=false)"].join("\n")
	assertEquals(got, want)
})
Deno.test("boolean,required", () => {
	const got = buildHelp({ boolean: ["verbose"], required: ["verbose"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --verbose    (required) (default: verbose=false)"].join("\n")
	assertEquals(got, want)
})
Deno.test("boolean,negatable", () => {
	const got = buildHelp({ boolean: ["color"], negatable: ["color"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --no-color    (default: color=true)"].join("\n")
	assertEquals(got, want)
})
Deno.test("string", () => {
	const got = buildHelp({ string: ["version"] })
	const want = ["Usage: cli [options]", "", "Options:", "  --version    <string>"].join("\n")
	assertEquals(got, want)
})
