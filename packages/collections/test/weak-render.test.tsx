import { artifactDirectory } from "./artifacts.ts";
import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStream } from "@solidjs/web";
import { WeakCollectionTokenPlugin } from "@solid-primitives/collections/serialization";
import { WeakTokenFixture, kinds } from "./fixtures/weak-collections.js";
import { AliasKeyFixture } from "./fixtures/alias-keys.tsx";
import { TracingFixture } from "./fixtures/tracing.tsx";
const directory = artifactDirectory("weak-ssr");
mkdirSync(directory, { recursive: true });

for (const kind of ["iterable", "promise"] as const)
  it(`renders a ${kind} tracing fixture`, async () => {
    const chunks: string[] = [];
    await new Promise<void>((resolve, reject) => {
      renderToStream(() => <TracingFixture kind={kind} />, { onError: reject }).pipe({
        write(chunk: string) {
          chunks.push(chunk);
        },
        end: resolve,
      });
    });
    writeFileSync(
      resolve(directory, `trace-${kind}.json`),
      JSON.stringify({ shell: chunks.join("") }),
    );
  });

for (const weak of [false, true])
  for (const optimistic of [false, true]) {
    it(`renders an early stable key, weak=${weak}, optimistic=${optimistic}`, async () => {
      let shell = "",
        shellDone = false;
      const chunks: string[] = [];
      await new Promise<void>((resolve, reject) => {
        renderToStream(() => <AliasKeyFixture weak={weak} optimistic={optimistic} />, {
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
      expect(shell).toContain("false");
      const rest = chunks.join("").slice(shell.length);
      expect(rest).not.toBe("");
      writeFileSync(
        resolve(directory, `aliases-${weak}-${optimistic}.json`),
        JSON.stringify({ shell, rest }),
      );
    });
  }
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
        if (kind === "stream") {
          expect(shell).not.toBe("");
          expect(full.slice(shell.length)).not.toBe("");
        }
        if (!shell) shell = full;
        expect(full.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, "")).toContain(
          kind === "loading" || kind === "client"
            ? "placeholder"
            : kind === "hybrid"
              ? "true:true:true:100"
              : "true:true:true:0",
        );
        writeFileSync(
          resolve(directory, `${kind}-${optimistic}.json`),
          JSON.stringify({ shell, rest: full.slice(shell.length) }),
        );
      });
    }
});
