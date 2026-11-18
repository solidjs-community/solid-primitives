/**
 * Packages that still target Solid 1.x. Their code stays in the repository until migrations to
 * Solid 2.0 are contributed, but they are skipped by every check and verification: tests, build,
 * `measure`, the published-manifest guard and the JSR version sync.
 *
 * One place cannot import this list and repeats it: the `lint:*` scripts in the root `package.json`
 * (`--ignore-pattern "packages/{...}/**"`). Keep it in sync when this list changes.
 *
 * Not covered: the JSR workflow (`deno publish --dry-run --check`) validates every workspace member
 * and is not scoped by this list.
 *
 * To bring a package back, migrate it and remove its name from this list and from the lint scripts.
 */
export const UNMIGRATED_PACKAGES: readonly string[] = ["fetch", "resource"];

export const isUnmigratedPackage = (name: string): boolean =>
  UNMIGRATED_PACKAGES.includes(name.replace(/^@solid-primitives\//, ""));
