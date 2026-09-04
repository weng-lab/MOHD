import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // graphql-codegen output. It is rewritten by `yarn gen-types`, so any lint
    // fix here is lost on the next run; doctor.config.json ignores it for the
    // same reason.
    "src/common/types/generated/**",
  ]),
]);

export default eslintConfig;
