import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStream } from "@solidjs/web";
import { WeakCollectionTokenPlugin } from "@solid-primitives/collections/serialization";
import { WeakTokenFixture, kinds } from "./fixtures/weak-collections.js";
const directory = resolve("node_modules/.cache/weak-ssr");
mkdirSync(directory, { recursive: true });
describe("SSR weak token projections", () => {
  for (const kind of kinds)
    for (const optimistic of [false, true]) {
      it(`${kind}, optimistic=${optimistic}`, async () => {
        const chunks: string[] = [];
        let shell = "",
          shellDone = false;
        await new Promise<void>((resolve, reject) => {
          renderToStream(() => <WeakTokenFixture kind={kind} optimistic={optimistic} />, {
            plugins: [WeakCollectionTokenPlugin],
            onCompleteShell() {
              shellDone = true;
            },
            onError: reject,
          }).pipe({
            write(chunk: string) {
              chunks.push(chunk);
              if (shellDone && !shell) shell = chunks.join("");
            },
            end: resolve,
          });
        });
        const full = chunks.join("");
        if (!shell) shell = full;
        expect(full.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, "")).toContain(
          kind === "loading" || kind === "client" ? "placeholder" : "true:true:true:0",
        );
        writeFileSync(
          resolve(directory, `${kind}-${optimistic}.json`),
          JSON.stringify({ shell, rest: full.slice(shell.length) }),
        );
      });
    }
});
