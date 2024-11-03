SHELL := bash

# TODO: move to deno.json

# e2e type check (good-result.golden must be empty, bad-result.golden must not be empty)
type-check: clean gen
	NO_COLOR=1 deno check e2e-tests/good-*.ts |& sed "s@`git rev-parse --show-toplevel`@ROOT@" > e2e-tests/good-result.golden
	NO_COLOR=1 deno check e2e-tests/bad-*.ts |& sed "s@`git rev-parse --show-toplevel`@ROOT@"> e2e-tests/bad-result.golden
	test -z "`grep -F ' = parsed.' e2e-tests/good-result.golden`"
.PHONY: type-check

clean:
	rm -rf e2e-tests/*.ts
.PHONY: clean

# generate test cases
gen:
	deno run -A ./e2e-tests/tools/gen.ts --dir ./e2e-tests
.PHONY: gen
