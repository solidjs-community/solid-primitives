import { build } from "tsup";
import { defineConfig } from "tsup-preset-solid";

/*

Toggle additional entries as needed.

`--dev` will enable creating a separate development module entry.
What goes in and out are decided by use of `process.env.DEV` or `process.env.PROD`.

`--ssr` will enable building a server-side entry (for use with SSR frameworks).
What goes in and out are decided by use of `process.env.SSR`.

`--jsx` will enable building a `solid` entry with preserved JSX.

`--write` or `-w` will write the exports configuration to package.json instead of to the console.
The exports configuration is taken from the solid-js package.json.

*/

const ssrEntry = process.argv.includes("--ssr");
const devEntry = process.argv.includes("--dev");
const jsxEntry = process.argv.includes("--jsx");
const writeExports = process.argv.includes("--write") || process.argv.includes("-w");
const printExports = !writeExports;

(async () => {
  let options = defineConfig(
    {
      entry: `src/index.${jsxEntry ? "tsx" : "ts"}`,
      devEntry: devEntry,
      serverEntry: ssrEntry
    },
    {
      cjs: true,
      writePackageJson: writeExports,
      printInstructions: printExports,
      dropConsole: true
    }
  );

  if (typeof options === "function") {
    options = await options({});
  }

  if (!Array.isArray(options)) {
    options = [options];
  }

  options.forEach(build);
})();
