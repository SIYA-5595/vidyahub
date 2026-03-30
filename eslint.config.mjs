import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    ".firebase/**",
    "next-env.d.ts",
    "dataconnect-generated/**",
    "playwright-report/**",
    "test-results/**",
    "blob-report/**",
    "functions/**",
    "*.js",
  ]),
]);

export default eslintConfig;
