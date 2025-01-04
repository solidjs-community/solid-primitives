import * as fs from "node:fs"
import * as fsp from "node:fs/promises"
import * as path from "node:path"
import ts from "typescript"
import * as esb from "esbuild"
import * as esb_solid from "esbuild-plugin-solid"
import * as utils from "./utils/index.js"

const ROOT_DIST_DIR = path.join(utils.ROOT_DIR, "dist")

// get packages to build based on cwd
const cwd_module_name = utils.getPackageNameFromCWD()
const module_names = cwd_module_name ? [cwd_module_name] : await fsp.readdir(utils.PACKAGES_DIR)

// Don't rebuild packages which source haven't changed
for (let i = module_names.length-1; i >= 0; i--) {
  const name = module_names[i]!
  const last_modified_src  = utils.getDirLastModifiedTimeSync(path.join(utils.PACKAGES_DIR, name, "src"))
  const last_modified_dist = utils.getDirLastModifiedTimeSync(path.join(utils.PACKAGES_DIR, name, "dist"))
  if (last_modified_dist > last_modified_src) {
    module_names.splice(i, 1)
    utils.log_info(`"${name}" skipped`)
  } else {
    utils.log_info(`"${name}" needs rebuild`)
  }
}

if (module_names.length === 0) {
  utils.log_info("No packages to build")
  process.exit(0)
}

const build_target_title = module_names.length > 1
  ? `${module_names.length} packages`
  : `"${module_names[0]}"`
utils.log_info(`Building ${build_target_title}...`)

const tsc_entries: string[] = []
const esb_entries: string[] = []

// Handle packages with custom entries
for (const name of module_names) {
  const src_dir = path.join(utils.PACKAGES_DIR, name, "src")

  switch (name) {
  case "controlled-props":
  case "virtual":
    tsc_entries.push(path.join(src_dir, "index.tsx"))
    esb_entries.push(path.join(src_dir, "index.tsx"))
    break
  case "storage":
    tsc_entries.push(path.join(src_dir, "index.ts"))
    tsc_entries.push(path.join(src_dir, "tauri.ts"))
    break
  case "utils":
    tsc_entries.push(path.join(src_dir, "index.ts"))
    tsc_entries.push(path.join(src_dir, "immutable/index.ts"))
    break
  default:
    tsc_entries.push(path.join(src_dir, "index.ts"))
    break
  }
}

// Emit d.ts and .js(x) files
try {
  const base_config_path = path.join(utils.ROOT_DIR, "tsconfig.json")
  const base_config_file = JSON.parse(fs.readFileSync(base_config_path, "utf-8"))
  const base_config      = ts.parseJsonConfigFileContent(base_config_file, ts.sys, utils.ROOT_DIR)

  ts.createProgram(tsc_entries, {
    ...base_config.options,
    noEmit:      false,
    declaration: true,
    outDir:      ROOT_DIST_DIR,
    rootDir:     utils.PACKAGES_DIR,
  }).emit()
  
  utils.log_info(`TSC step done.`)
} catch (err) {
  utils.log_error("TSC step failed.")
  throw err
}

// Emit .js files for packages with jsx
try {
  if (esb_entries.length > 0) {
    await esb.build({
      plugins:     [esb_solid.solidPlugin()],
      entryPoints: esb_entries,
      outdir:      ROOT_DIST_DIR,
      format:      "esm",
      platform:    "browser",
      target:      ["esnext"]
    })
    utils.log_info(`esbuild step done.`)
  }
} catch (err) {
  utils.log_error("esbuild step failed.")
  throw err
}

// Copy declarations to /packages/*/dist/
try {
  await Promise.all(module_names.map(async name => {
    const module_dist_dir = path.join(ROOT_DIST_DIR, name, "src")
    const target_dist_dir = path.join(utils.PACKAGES_DIR, name, "dist")
    return utils.copyDirectory(module_dist_dir, target_dist_dir)
  }))
  
  await fsp.rm(ROOT_DIST_DIR, {recursive: true, force: true})

  utils.log_info(`Output copied.`)
} catch (err) {
  utils.log_error("Copying output failed.")
  throw err
}

utils.log_info(`Built ${build_target_title} in ${Math.ceil(performance.now())}ms`)
