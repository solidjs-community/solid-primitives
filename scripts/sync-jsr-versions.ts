// Keeps each package's deno.jsonc "version" in sync with its package.json
// "version", which is the source of truth (bumped by Changesets). JSR has no
// awareness of Changesets, so without this the two files silently drift.
//
// Usage:
//   pnpm jsr:sync-versions          # write the fix
//   pnpm jsr:sync-versions --check  # exit 1 if anything is out of sync, don't write
import * as fs from "node:fs";
import * as path from "node:path";

const check = process.argv.includes("--check");
const packagesDir = path.resolve(import.meta.dirname, "../packages");

let mismatches = 0;

for (const name of fs.readdirSync(packagesDir)) {
  const dir = path.join(packagesDir, name);
  const denoPath = path.join(dir, "deno.jsonc");
  const pkgPath = path.join(dir, "package.json");
  if (!fs.existsSync(denoPath) || !fs.existsSync(pkgPath)) continue;

  const pkgVersion = JSON.parse(fs.readFileSync(pkgPath, "utf8")).version;
  const denoText = fs.readFileSync(denoPath, "utf8");
  const match = denoText.match(/"version":\s*"([^"]+)"/);
  if (!match || match[1] === pkgVersion) continue;

  mismatches++;
  console.log(`${name}: ${match[1]} -> ${pkgVersion}`);

  if (!check) {
    fs.writeFileSync(denoPath, denoText.replace(/"version":\s*"[^"]+"/, `"version": "${pkgVersion}"`));
  }
}

if (mismatches === 0) {
  console.log("All deno.jsonc versions are in sync with package.json.");
} else if (check) {
  console.error(
    `\n${mismatches} package(s) have a deno.jsonc version out of sync with package.json. Run 'pnpm jsr:sync-versions' to fix.`,
  );
  process.exit(1);
}
