/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { flush } from "solid-js";
import { hydrate } from "@solidjs/web";
import {
  CollectionFixture,
  SetCollectionFixture,
  current,
  currentSet,
  kinds,
} from "./fixtures/collections.js";
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));
async function expectView(container: Element, read: () => string, expected: string) {
  await vi.waitFor(
    () => {
      flush();
      expect(read()).toBe(expected);
      expect(container.textContent).toBe(expected + "after");
    },
    { timeout: 1500, interval: 10 },
  );
}
function apply(container: Element, chunk: string, first: boolean) {
  const pattern = /<script(?:[^>]*)>([\s\S]*?)<\/script>/g;
  const scripts = [...chunk.matchAll(pattern)].map(m => m[1]!);
  const markup = chunk.replace(pattern, "");
  if (first) container.innerHTML = markup;
  else container.insertAdjacentHTML("beforeend", markup);
  for (const script of scripts) (0, eval)(script);
}
describe("real SSR to collection hydration", () => {
  for (const kind of kinds)
    for (const optimistic of [false, true])
      for (const mode of ["loaded", "streamed"] as const) {
        it(`${kind}, optimistic=${optimistic}, ${mode}`, async () => {
          const artifact = JSON.parse(
            readFileSync(
              resolve(`node_modules/.cache/collections-hydration/${kind}-${optimistic}.json`),
              "utf8",
            ),
          );
          const container = document.createElement("div");
          document.body.appendChild(container);
          (globalThis as any)._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };
          const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
          let dispose: (() => void) | undefined;
          try {
            apply(container, artifact.shell, true);
            if (mode === "loaded" && artifact.rest) apply(container, artifact.rest, false);
            const section = container.querySelector("section"),
              sibling = container.querySelector("b");
            dispose = hydrate(
              () => <CollectionFixture kind={kind} optimistic={optimistic} />,
              container,
            );
            flush();
            await sleep(kind.includes("hybrid") ? 50 : 10);
            flush();
            if (mode === "streamed" && artifact.rest) apply(container, artifact.rest, false);
            const streamed = kind === "stream" || kind.includes("hybrid");
            await expectView(
              container,
              current.read,
              streamed ? "true:10:true:true:2:true" : "true:0:true:true:1:false",
            );
            expect(container.querySelector("section")).toBe(section);
            expect(container.querySelector("b")).toBe(sibling);
            current.update();
            flush();
            const updated = streamed ? "true:11:true:true:2:true" : "true:1:true:true:1:false";
            await expectView(
              container,
              current.read,
              streamed ? "true:11:true:true:2:true" : "true:1:true:true:1:false",
            );
            await current.refresh();
            await expectView(container, current.read, updated);
            expect(warn).not.toHaveBeenCalled();
          } finally {
            dispose?.();
            await sleep(0);
            warn.mockRestore();
            container.remove();
          }
        });
      }
});

describe("real Set hydration", () => {
  for (const kind of ["stream", "loading", "client", "hybrid"] as const)
    for (const optimistic of [false, true])
      for (const mode of ["loaded", "streamed"]) {
        it(`${kind}, optimistic=${optimistic}, ${mode}`, async () => {
          const artifact = JSON.parse(
            readFileSync(
              resolve(`node_modules/.cache/collections-hydration/set-${kind}-${optimistic}.json`),
              "utf8",
            ),
          );
          const container = document.createElement("div");
          document.body.appendChild(container);
          (globalThis as any)._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };
          const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
          let dispose: (() => void) | undefined;
          try {
            apply(container, artifact.shell, true);
            if (mode === "loaded" && artifact.rest) apply(container, artifact.rest, false);
            const section = container.querySelector("section"),
              sibling = container.querySelector("b");
            dispose = hydrate(
              () => <SetCollectionFixture kind={kind} optimistic={optimistic} />,
              container,
            );
            flush();
            await sleep(10);
            flush();
            if (mode === "streamed" && artifact.rest) apply(container, artifact.rest, false);
            await expectView(container, currentSet.read, "true:true:true:5:true:true");
            expect(container.querySelector("section")).toBe(section);
            expect(container.querySelector("b")).toBe(sibling);
            currentSet.update();
            flush();
            await expectView(container, currentSet.read, "true:true:true:5:true:true");
            await currentSet.refresh();
            await expectView(container, currentSet.read, "true:true:true:5:true:true");
            expect(warn).not.toHaveBeenCalled();
          } finally {
            dispose?.();
            await sleep(0);
            warn.mockRestore();
            container.remove();
          }
        });
      }
});
