import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    ignores: [
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
    ],
  },
  ...nextVitals,
  ...nextTs,
]);

export default eslintConfig;
