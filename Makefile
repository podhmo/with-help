SHELL := bash

# TODO: move to deno.json

# e2e type check
type-check: clean gen
	NO_COLOR=1 deno check e2e-tests/*.ts |& sed "s@`git rev-parse --show-toplevel`@ROOT@"| tee e2e-tests/result.golden
.PHONY: type-check

clean:
	rm -rf e2e-tests/*.ts
.PHONY: clean

# generate test cases
gen:
	deno run -A ./e2e-tests/tools/gen.ts --dir ./e2e-tests
.PHONY: gen
