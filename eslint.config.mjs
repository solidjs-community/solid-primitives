import typescriptEslint from "@typescript-eslint/eslint-plugin";
import noOnlyTests from "eslint-plugin-no-only-tests";
import eslintComments from "eslint-plugin-eslint-comments";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config} */
export default {

  files: ["**/*.{js,mjs,jsx,ts,tsx}"],
  ignores: ["**/{dist,node_modules,__snapshots__}/**/*", "packages/*/dev/**/*", "site/**/*"],

  plugins: {
    "@typescript-eslint": typescriptEslint,
    "no-only-tests": noOnlyTests,
    "eslint-comments": eslintComments,
  },

  languageOptions: {
    parser: tsParser,
    ecmaVersion: 5,
    sourceType: "module",

    parserOptions: {
      project: "./tsconfig.json",
      tsconfigRootDir: ".",
    },
  },

  rules: {
    "no-console": "warn",
    "no-debugger": "warn",
    "prefer-const": "warn",

    "@typescript-eslint/no-unused-vars": ["warn", {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
    }],

    "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/no-unnecessary-qualifier": "warn",
    "@typescript-eslint/no-unnecessary-type-arguments": "warn",
    "@typescript-eslint/no-unnecessary-type-assertion": "warn",
    "@typescript-eslint/no-unnecessary-type-constraint": "warn",
    "@typescript-eslint/no-useless-empty-export": "warn",
    "eslint-comments/no-unused-disable": "warn",
    "no-only-tests/no-only-tests": "warn",
  },
};
