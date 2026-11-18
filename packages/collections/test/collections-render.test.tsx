import { artifactDirectory } from "./artifacts.ts";
import { describe, expect, it } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { renderToStream } from "@solidjs/web";
import { CollectionFixture, SetCollectionFixture, kinds } from "./fixtures/collections.js";
const directory = artifactDirectory("collections-hydration");
mkdirSync(directory, { recursive: true });

function streamArtifact(chunks: string[], shell: string, streamed: boolean) {
  const full = chunks.join("");
  if (!streamed) return { shell, rest: full.slice(shell.length) };
  const tailChunk = chunks.findIndex(chunk => chunk.includes('"k:string:tail"'));
  expect(tailChunk).toBeGreaterThan(0);
  const split = chunks.slice(0, tailChunk).join("").length;
  expect(split).toBeGreaterThan(shell.length);
  return {
    shell,
    rest: full.slice(shell.length),
    earlyRest: full.slice(shell.length, split),
    lateRest: full.slice(split),
  };
}
describe("real collection SSR fixtures", () => {
  for (const kind of kinds)
    for (const optimistic of [false, true]) {
      it(`${kind}, optimistic=${optimistic}`, async () => {
        const chunks: string[] = [];
        let shell = "",
          shellDone = false;
        await new Promise<void>((resolve, reject) => {
          renderToStream(() => <CollectionFixture kind={kind} optimistic={optimistic} />, {
            onCompleteShell() {
              shellDone = true;
            },
            onError(error) {
              reject(error);
            },
          }).pipe({
            write(chunk: string) {
              chunks.push(chunk);
              if (shellDone && !shell) shell = chunks.join("");
            },
            end() {
              resolve();
            },
          });
        });
        const full = chunks.join("");
        if (kind === "stream") {
          expect(shell).not.toBe("");
          expect(full.slice(shell.length)).not.toBe("");
        }
        if (!shell) shell = full;
        const visible = full.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, "");
        expect(visible).toContain(
          kind === "loading" || kind === "client" ? "placeholder" : "true:0:true:true:1:false",
        );
        expect(visible).toContain("after");
        writeFileSync(
          resolve(directory, `${kind}-${optimistic}.json`),
          JSON.stringify(streamArtifact(chunks, shell, kind === "stream")),
        );
      });
    }
});

describe("real Set SSR fixtures", () => {
  for (const kind of ["stream", "loading", "client", "hybrid"] as const)
    for (const optimistic of [false, true]) {
      it(`${kind}, optimistic=${optimistic}`, async () => {
        const chunks: string[] = [];
        let shell = "",
          shellDone = false;
        await new Promise<void>((resolve, reject) => {
          renderToStream(() => <SetCollectionFixture kind={kind} optimistic={optimistic} />, {
            onCompleteShell() {
              shellDone = true;
            },
            onError(error) {
              reject(error);
            },
          }).pipe({
            write(chunk: string) {
              chunks.push(chunk);
              if (shellDone && !shell) shell = chunks.join("");
            },
            end() {
              resolve();
            },
          });
        });
        const full = chunks.join("");
        if (kind === "stream") {
          expect(shell).not.toBe("");
          expect(full.slice(shell.length)).not.toBe("");
        }
        if (!shell) shell = full;
        const visible = full.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]*>/g, "");
        expect(visible).toContain(
          kind === "stream" ? "true:true:true:4:false:true:0" : "placeholder",
        );
        writeFileSync(
          resolve(directory, `set-${kind}-${optimistic}.json`),
          JSON.stringify(streamArtifact(chunks, shell, kind === "stream")),
        );
      });
    }
});
