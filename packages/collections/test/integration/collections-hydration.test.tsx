/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { action, flush } from "solid-js";
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

async function checkLocalEdits(collection: Map<any, any> | Set<unknown>, optimistic: boolean) {
  const snapshot = [...collection];
  const shared = [...collection.keys()].find(key => typeof key === "object" && key !== null);
  expect(shared).toBeDefined();
  const local = { tag: "client-only" };
  const before = collection.keys();
  expect(before.next().value).toBe(shared);
  let release!: () => void;
  const gate = new Promise<void>(resolve => {
    release = resolve;
  });
  const edit = () => {
    if (collection instanceof Map) {
      const value = collection.get(shared);
      collection.set(local, value);
      collection.delete(shared);
      collection.set(shared, value);
    } else {
      collection.add(local);
      collection.delete(shared);
      collection.add(shared);
    }
  };
  const pending = optimistic
    ? action(function* () {
        edit();
        yield gate;
      })()
    : undefined;
  if (!optimistic) edit();
  try {
    flush();
    const keys = [...collection.keys()];
    expect(keys.at(-2)).toBe(local);
    expect(keys.at(-1)).toBe(shared);
    expect(collection.has(local)).toBe(true);
    expect(collection.has(shared)).toBe(true);
    expect([...before]).toEqual(keys);
  } finally {
    release();
    await pending;
    flush();
  }
  if (!optimistic) {
    collection.clear();
    for (const entry of snapshot) {
      if (collection instanceof Map) collection.set(entry[0], entry[1]);
      else collection.add(entry);
    }
    flush();
  }
  expect([...collection]).toEqual(snapshot);
  expect(collection.has(local)).toBe(false);
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
            if (current.map) await checkLocalEdits(current.map, optimistic);
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
            await checkLocalEdits(currentSet.set, optimistic);
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
