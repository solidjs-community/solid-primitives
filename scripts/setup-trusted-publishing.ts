// Registers a GitHub Actions trusted publisher on npm for every public package
// under packages/*, so the release workflow can publish via OIDC (no NPM_TOKEN).
// Trusted publishing cannot create a package, so each one must already exist on npm.
//
// Requires `npm login` first; `npm trust` may prompt for a 2FA OTP per call.
// Idempotent: packages that already have a matching entry are skipped.
//
// Usage:
//   pnpm setup:trusted-publishing [--dry-run] [--file release-tagged.yml] [--only a,b] [--otp 123456]
//   (--only accepts full names or bare names, e.g. `set` or `@solid-primitives/set`)
import * as fs from "node:fs";
import * as path from "node:path";
import { execFileSync } from "node:child_process";
import * as readline from "node:readline";
import { parseArgs } from "node:util";

const REPO = "solidjs-community/solid-primitives";
const DELAY_MS = 3000;
const RATE_LIMIT_WAIT_MS = 60_000;
const MAX_RATE_LIMIT_RETRIES = 10;

const repoRoot = path.resolve(import.meta.dirname, "..");
const { values } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    file: { type: "string", default: "release-tagged.yml" },
    only: { type: "string" },
    otp: { type: "string" },
  },
});
const dryRun = values["dry-run"]!;
const file = values.file!;
const only = values.only
  ?.split(",")
  .map(s => s.trim())
  .filter(Boolean)
  .map(s => (s.startsWith("@") ? s : `@solid-primitives/${s}`));

const packagesDir = path.join(repoRoot, "packages");
let names = fs
  .readdirSync(packagesDir)
  .map(dir => path.join(packagesDir, dir, "package.json"))
  .filter(p => fs.existsSync(p))
  .map(p => JSON.parse(fs.readFileSync(p, "utf8")) as { name: string; private?: boolean })
  .filter(pkg => !pkg.private)
  .map(pkg => pkg.name)
  .sort();

if (only) {
  const missing = only.filter(n => !names.includes(n));
  if (missing.length) {
    console.error(`Unknown package(s): ${missing.join(", ")}`);
    process.exit(1);
  }
  names = names.filter(n => only.includes(n));
}

let otp = values.otp;

const runNpm = (args: string[]) =>
  execFileSync("npm", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["inherit", "pipe", "pipe"],
    // `npm trust list` also demands an OTP but rejects `--otp`, so pass it via the env config.
    env: otp ? { ...process.env, npm_config_otp: otp } : process.env,
  });

const errorMessage = (err: unknown) => {
  const e = err as { stderr?: string; message?: string };
  const stderr = (e.stderr ?? "")
    .split("\n")
    .filter(line => !line.startsWith("npm warn") && !line.startsWith("npm notice"))
    .join("\n")
    .trim();
  return stderr || e.message || String(err);
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const askOtp = () => new Promise<string>(resolve => rl.question("npm OTP: ", a => resolve(a.trim())));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Retries with a freshly prompted OTP on EOTP, and waits out registry rate limits on E429.
const npm = async (args: string[]): Promise<string> => {
  let otpPrompts = 0;
  for (let rateLimited = 0; ; ) {
    try {
      return runNpm(args);
    } catch (err) {
      const message = errorMessage(err);
      if (/EOTP/.test(message) && otpPrompts++ < 2) {
        otp = await askOtp();
      } else if (/E429|Too Many Requests/i.test(message) && rateLimited++ < MAX_RATE_LIMIT_RETRIES) {
        const wait = RATE_LIMIT_WAIT_MS * rateLimited;
        console.log(`  rate limited, waiting ${wait / 1000}s (retry ${rateLimited}/${MAX_RATE_LIMIT_RETRIES})`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
};

// Entry shape isn't pinned down, so match on the serialized entry.
const isConfigured = async (pkg: string): Promise<boolean> => {
  let out: string;
  try {
    out = await npm(["trust", "list", pkg, "--json"]);
  } catch (err) {
    // A package with no trust entries may exit non-zero; treat that as "none".
    if (/E404|no trust|not found/i.test(errorMessage(err))) return false;
    throw err;
  }
  if (!out.trim()) return false;
  const entries: unknown[] = [].concat(JSON.parse(out));
  const matching = entries.filter(entry => {
    const text = JSON.stringify(entry);
    return text.includes(REPO) && text.includes(file);
  });
  // An entry scoped to a GitHub environment only accepts jobs that declare that environment,
  // which the release workflow doesn't, so OIDC would still 404.
  const scoped = matching.find(entry => /"environment"\s*:\s*"[^"]+"/.test(JSON.stringify(entry)));
  if (scoped && matching.length === 1) {
    throw new Error(
      `existing entry is scoped to an environment, so the workflow can't use it. ` +
        `Revoke it (npm trust revoke ${pkg} --id <id>) and re-run: ${JSON.stringify(scoped)}`,
    );
  }
  return matching.length > 0;
};

const created: string[] = [];
const already: string[] = [];
const failed: { name: string; reason: string }[] = [];

for (const [i, name] of names.entries()) {
  if (i > 0) await sleep(DELAY_MS);
  try {
    if (await isConfigured(name)) {
      already.push(name);
      console.log(`= ${name} (already configured)`);
      continue;
    }
    const args = ["trust", "github", name, "--repo", REPO, "--file", file, "--allow-publish", "--yes"];
    if (dryRun) args.push("--dry-run");
    await npm(args);
    created.push(name);
    console.log(`+ ${name}${dryRun ? " (dry run)" : ""}`);
  } catch (err) {
    const reason = errorMessage(err);
    failed.push({ name, reason });
    console.error(`! ${name}: ${reason}`);
  }
}

rl.close();
console.log(
  `\n${dryRun ? "Would create" : "Created"}: ${created.length}, already configured: ${already.length}, failed: ${failed.length}`,
);
if (failed.length) {
  for (const f of failed) console.error(`  - ${f.name}`);
  process.exit(1);
}
