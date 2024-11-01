SHELL := bash

# e2e type check (TODO: move to deno.json)
type-check:
	deno run -A ./e2e-tests/gen.ts --dir ./e2e-tests
	NO_COLOR=1 deno check e2e-tests/*.ts |& sed "s@`git rev-parse --show-toplevel`@ROOT@"| tee e2e-tests/result.golden
.PHONY: type-check
