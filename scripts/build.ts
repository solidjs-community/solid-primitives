import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { Options, build } from "tsup";
import type { PackageJson } from "type-fest";

/*

Toggle additional entries as needed.

`--dev` will enable creating a separate development module entry.
What goes in and out are decided by use of `process.env.DEV` or `process.env.PROD`.

`--ssr` will enable building a server-side entry (for use with SSR frameworks).
What goes in and out are decided by use of `process.env.SSR`.

`--write` or `-w` will write the exports configuration to package.json instead of to the console.
The exports configuration is taken from the solid-js package.json.

*/

const cwd = process.cwd();
const ssrEntry = process.argv.includes("--ssr");
const devEntry = process.argv.includes("--dev");
const writeExports = process.argv.includes("--write") || process.argv.includes("-w");
const isCI = process.env.CI === "true" || process.env.CI === "1";
const printExports = !writeExports && !isCI;

const getEnvVars = (mode: "dev" | "prod" | "ssr"): Options => ({
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      "process.env.NODE_ENV": mode === "dev" ? `"development"` : `"production"`,
      "process.env.PROD": mode === "dev" ? '""' : '"1"',
      "process.env.DEV": mode === "dev" ? '"1"' : '""',
      "process.env.SSR": mode === "ssr" ? '"1"' : '""'
    };
  }
});

function createTsupConfig({ onSuccess }: { onSuccess?: () => void | Promise<void> } = {}) {
  const common: Options = {
    format: ["esm", "cjs"],
    treeshake: true,
    replaceNodeEnv: true,
    onSuccess: handleSuccess
  };

  const entries: Options[] = [
    {
      ...common,
      dts: "src/index.ts",
      entryPoints: ["src/index.ts"],
      ...getEnvVars("prod")
    }
  ];

  if (ssrEntry) {
    entries.push({
      ...common,
      entryPoints: { server: "src/index.ts" },
      ...getEnvVars("ssr")
    });
  }

  if (devEntry) {
    entries.push({
      ...common,
      entryPoints: { dev: "src/index.ts" },
      ...getEnvVars("dev")
    });
  }

  let buildsToComplete = entries.length;

  async function handleSuccess() {
    if (--buildsToComplete > 0) return;
    onSuccess?.();
  }

  return entries;
}

const getExports = (): PackageJson => ({
  type: "module",
  ...(ssrEntry
    ? {
        main: "./dist/server.cjs",
        module: "./dist/server.js",
        browser: {
          "./dist/server.cjs": "./dist/index.cjs",
          "./dist/server.js": "./dist/index.js"
        }
      }
    : {
        main: "./dist/index.cjs",
        module: "./dist/index.js",
        browser: {}
      }),
  types: "./dist/index.d.ts",
  exports: {
    ...(ssrEntry && {
      worker: {
        import: "./dist/server.js",
        require: "./dist/server.cjs"
      }
    }),
    browser: {
      ...(devEntry && {
        development: {
          import: "./dist/dev.js",
          require: "./dist/dev.cjs"
        }
      }),
      import: "./dist/index.js",
      require: "./dist/index.cjs"
    },
    ...(ssrEntry && {
      deno: {
        import: "./dist/server.js",
        require: "./dist/server.cjs"
      },
      node: {
        import: "./dist/server.js",
        require: "./dist/server.cjs"
      }
    }),
    ...(devEntry && {
      development: {
        import: "./dist/dev.js",
        require: "./dist/dev.cjs"
      }
    }),
    import: "./dist/index.js",
    require: "./dist/index.cjs"
  }
});

function printInstrunctions() {
  console.log(
    `\npackage.json exports should look like this:\n\n${JSON.stringify(getExports(), null, 2)}\n`
  );
}

async function writeExportsFile() {
  const pkgJsonPath = path.resolve(cwd, "package.json");
  const pkgJson = JSON.parse(await fsp.readFile(pkgJsonPath, "utf8"));
  const newPkjJson = { ...pkgJson, ...getExports() };
  await fsp.writeFile(pkgJsonPath, JSON.stringify(newPkjJson, null, 2));
}

// clear dist
fs.rmSync(path.resolve(cwd, `dist`), { recursive: true, force: true });

createTsupConfig({
  onSuccess() {
    if (printExports) printInstrunctions();
    if (writeExports) writeExportsFile();
  }
}).forEach(config => build(config));
