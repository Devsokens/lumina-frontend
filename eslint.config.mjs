import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // dangerouslySetInnerHTML interdit — voir LUMINA_Audit_Menaces_Complet.md
    // section 2.1 (Stored XSS) et LUMINA_FRONTEND_CONTEXT.md 4.7.
    rules: {
      "react/no-danger": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    "public/swe-worker*.js",
  ]),
]);

export default eslintConfig;
