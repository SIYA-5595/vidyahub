<<<<<<< HEAD
import { defineConfig } from "eslint/config";
=======
import { defineConfig, globalIgnores } from "eslint/config";
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
<<<<<<< HEAD
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
=======
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
>>>>>>> 7b5adfad5317e2e395ba8d84302ecc9d67bc1901
]);

export default eslintConfig;
