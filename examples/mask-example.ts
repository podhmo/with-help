import { parseArgs, printHelp } from "../mod.ts";

const options = parseArgs(Deno.args, {
  name: "mask-example",
  string: ["accessJwt", "password"],
  required: ["accessJwt", "password"],
  mask: ["accessJwt", "password"],
  default: {
    accessJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    password: "password",
  },
});

printHelp(options);
