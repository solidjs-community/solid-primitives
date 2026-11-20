import { resolve } from "node:path";

export function artifactDirectory(suite: string): string {
  return resolve(process.env.COLLECTIONS_TEST_ARTIFACTS ?? "node_modules/.cache", suite);
}
