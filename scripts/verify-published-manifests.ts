// Guards against unresolved pnpm workspace-protocol strings (`catalog:`,
// `catalog:<name>`, `workspace:`) making it into a package's PUBLISHED
// manifest. Source package.json files are expected to contain these
// protocols — pnpm resolves them at pack/publish time. This script actually
// packs every package (via `pnpm pack`, the same manifest-resolution path
// `pnpm publish` uses) and inspects the packed package/package.json, not the
// source file, so it only fails on a genuine resolution failure.
//
// Background: @solid-primitives/event-listener@3.0.0-next.4 and
// @solid-primitives/pagination@1.0.0-next.7 were published to npm with
// literal "catalog:peer" strings left in peerDependencies, which breaks
// plain npm/yarn installs (EUNSUPPORTEDPROTOCOL). See
// https://github.com/solidjs-community/solid-primitives/issues/1052.
//
// Usage: pnpm run verify:manifests
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(import.meta.dirname, "..");
const DEP_FIELDS = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"] as const;
const BAD_PROTOCOLS = ["catalog:", "workspace:"];

type PackedPackage = { name: string; version: string; filename: string };

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "verify-manifests-"));

let packed: PackedPackage[];
try {
  const output = execFileSync(
    "pnpm",
    ["pack", "--recursive", "--json", "--pack-destination", tmpDir],
    { cwd: repoRoot, encoding: "utf8", maxBuffer: 1024 * 1024 * 64 },
  );
  packed = JSON.parse(output);
} catch (err) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  throw err;
}

const failures: string[] = [];

for (const pkg of packed) {
  const manifestText = execFileSync("tar", ["-xzO", "-f", pkg.filename, "package/package.json"], {
    encoding: "utf8",
  });
  const manifest = JSON.parse(manifestText);

  for (const field of DEP_FIELDS) {
    const deps = manifest[field];
    if (!deps) continue;
    for (const [dep, range] of Object.entries(deps)) {
      if (typeof range === "string" && BAD_PROTOCOLS.some(p => range.startsWith(p))) {
        failures.push(`${pkg.name}@${pkg.version} ${field}.${dep} = "${range}"`);
      }
    }
  }
}

fs.rmSync(tmpDir, { recursive: true, force: true });

if (failures.length > 0) {
  console.error("Unresolved workspace-protocol strings found in packed manifests:\n");
  for (const f of failures) console.error(`  - ${f}`);
  console.error(
    "\nThese packages would be published to npm broken (npm/yarn can't resolve `catalog:`/`workspace:`). Aborting release.",
  );
  process.exit(1);
}

console.log(`Verified ${packed.length} packed manifests: no unresolved workspace protocols.`);
