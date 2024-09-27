import * as fs from "node:fs"
import * as fsp from "node:fs/promises"
import * as path from "node:path"
import ts from "typescript"
import * as esb from "esbuild"
import * as esb_solid from "esbuild-plugin-solid"
import * as utils from "./utils/index.js"

let begin = performance.now()

let dts_dist_dir = path.join(utils.ROOT_DIR, "dist")

let module_names = await fsp.readdir(utils.PACKAGES_DIR)

let tsc_entries: string[] = []
let esb_entries: string[] = []

for (let name of module_names) {
  let src_dir = path.join(utils.PACKAGES_DIR, name, "src")

  switch (name) {
  case "controlled-props":
  case "virtual":
    tsc_entries.push(path.join(src_dir, "index.tsx"))
    esb_entries.push(path.join(src_dir, "index.tsx"))
  case "storage":
    tsc_entries.push(path.join(src_dir, "index.ts"))
    tsc_entries.push(path.join(src_dir, "tauri.ts"))
  case "utils":
    tsc_entries.push(path.join(src_dir, "index.ts"))
    tsc_entries.push(path.join(src_dir, "immutable/index.ts"))
  default:
    tsc_entries.push(path.join(src_dir, "index.ts"))
  }
}

// Emit .js files for packages with jsx

let esb_promise = esb.build({
  plugins: [esb_solid.solidPlugin()],
  entryPoints: esb_entries,
  outdir: dts_dist_dir,
  format: "esm",
  platform: "browser",
  target: ["esnext"]
})

// Emit d.ts and .js(x) files

let base_config_path = path.join(utils.ROOT_DIR, "tsconfig.json")
let base_config_file = JSON.parse(fs.readFileSync(base_config_path, "utf-8"))
let base_config      = ts.parseJsonConfigFileContent(base_config_file, ts.sys, utils.ROOT_DIR)

ts.createProgram(tsc_entries, {
  ...base_config.options,
  noEmit     : false,
  declaration: true,
  outDir     : dts_dist_dir,
}).emit()

await esb_promise

// Copy declarations to /packages/*/dist/

await Promise.all(module_names.map(async name => {
  let module_dist_dir = path.join(dts_dist_dir, name, "src")
  let target_dist_dir = path.join(utils.PACKAGES_DIR, name, "dist")
  
  return utils.copyDirectory(module_dist_dir, target_dist_dir)
}))

await fsp.rm(dts_dist_dir, {recursive: true, force: true})

utils.logLine(`Built ${module_names.length} packages in ${Math.ceil(performance.now() - begin)}ms`)
