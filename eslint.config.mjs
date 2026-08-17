import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * `package.json` has had a `lint` script since the start, but no config file
 * was ever committed — so `npm run lint` failed on a fresh clone with ESLint's
 * flat-config migration notice. This is that missing file, matching the
 * eslint-config-next version already in devDependencies.
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
