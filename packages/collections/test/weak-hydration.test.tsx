import { artifactDirectory } from "./artifacts.ts";
/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { action, flush } from "solid-js";
import { hydrate } from "@solidjs/web";
import { WeakTokenFixture, kinds, current, releaseHybrid } from "./fixtures/weak-collections.js";
import { AliasKeyFixture, aliasCurrent } from "./fixtures/alias-keys.tsx";
import { TracingFixture, traceCurrent, traceKinds } from "./fixtures/tracing.tsx";
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
function apply(container: Element, chunk: string, first: boolean) {
  const pattern = /<script(?:[^>]*)>([\s\S]*?)<\/script>/g;
  const scripts = [...chunk.matchAll(pattern)].map(m => m[1]!);
  const markup = chunk.replace(pattern, "");
  if (first) container.innerHTML = markup;
  else container.insertAdjacentHTML("beforeend", markup);
  for (const script of scripts) (0, eval)(script);
}

for (const kind of traceKinds)
  it(`does not leak discarded ${kind} hydration traces`, async () => {
    const artifact = JSON.parse(
      readFileSync(resolve(artifactDirectory("weak-ssr"), `trace-${kind}.json`), "utf8"),
    );
    const container = document.createElement("div");
    document.body.appendChild(container);
    (globalThis as any)._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };
    let dispose: (() => void) | undefined;
    try {
      apply(container, artifact.shell, true);
      dispose = hydrate(() => <TracingFixture kind={kind} />, container);
      flush();
      await sleep(10);
      expect(traceCurrent.read()).toBe(1);
      expect(container.textContent).toBe("1");
      const liveGenerator = kind === "generator-live" || kind === "generator-accessor";
      await vi.waitFor(() => {
        expect(traceCurrent.opened).toBe(liveGenerator ? 1 : 0);
        expect(traceCurrent.closed).toBe(liveGenerator ? 1 : 0);
      });
      traceCurrent.update();
      await vi.waitFor(() => {
        flush();
        expect(container.textContent).toBe("2");
      });
      expect(traceCurrent.opened).toBe(liveGenerator ? 2 : kind === "iterable" ? 1 : 0);
      if (liveGenerator) expect(traceCurrent.closed).toBe(1);
    } finally {
      dispose?.();
      traceCurrent.release();
      container.remove();
    }
    if (kind === "iterable") expect(traceCurrent.closed).toBe(1);
    if (kind === "generator-live" || kind === "generator-accessor")
      await vi.waitFor(() => expect(traceCurrent.closed).toBe(2));
  });

for (const weak of [false, true])
  for (const optimistic of [false, true]) {
    it(`updates early key observers on payload adoption, weak=${weak}, optimistic=${optimistic}`, async () => {
      const artifact = JSON.parse(
        readFileSync(
          resolve(artifactDirectory("weak-ssr"), `aliases-${weak}-${optimistic}.json`),
          "utf8",
        ),
      );
      const container = document.createElement("div");
      document.body.appendChild(container);
      (globalThis as any)._$HY = { events: [], completed: new WeakSet(), r: {}, fe() {} };
      let dispose: (() => void) | undefined;
      try {
        apply(container, artifact.shell, true);
        dispose = hydrate(() => <AliasKeyFixture weak={weak} optimistic={optimistic} />, container);
        flush();
        expect(aliasCurrent.has.at(-1)).toBe(false);
        expect(aliasCurrent.get.length).toBeGreaterThan(0);
        expect(aliasCurrent.get.at(-1)).toBeUndefined();
        apply(container, artifact.rest, false);
        flush();
        await vi.waitFor(() => {
          flush();
          expect(aliasCurrent.has.at(-1)).toBe(true);
          expect(aliasCurrent.get.at(-1)).toBe(1);
          expect(container.textContent).toBe("true1");
        });
        expect(aliasCurrent.read()).toEqual([true, 1]);
        expect(aliasCurrent.has.at(-1)).toBe(true);
        expect(aliasCurrent.get.at(-1)).toBe(1);
        expect(container.textContent).toBe("true1");
      } finally {
        dispose?.();
        container.remove();
      }
    });
  }
describe("real weak token projection hydration", () => {
  for (const kind of kinds)
    for (const optimistic of [false, true])
      for (const mode of ["loaded", "streamed"]) {
        it(`${kind}, optimistic=${optimistic}, ${mode}`, async () => {
          const artifact = JSON.parse(
            readFileSync(
              resolve(artifactDirectory("weak-ssr"), `${kind}-${optimistic}.json`),
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
            const section = container.querySelector("section");
            dispose = hydrate(
              () => <WeakTokenFixture kind={kind} optimistic={optimistic} />,
              container,
            );
            flush();
            await sleep(kind === "hybrid" ? 50 : 10);
            flush();
            if (mode === "streamed" && artifact.rest) apply(container, artifact.rest, false);
            const n = kind === "stream" || kind === "hybrid" ? 10 : 0;
            const expectValue = async (count: number) =>
              vi.waitFor(
                () => {
                  flush();
                  expect(current.read()).toBe(`true:true:true:${count}`);
                  expect(container.textContent).toBe(`true:true:true:${count}after`);
                },
                { timeout: 1500, interval: 10 },
              );
            if (kind === "hybrid") {
              try {
                await expectValue(100);
              } finally {
                releaseHybrid?.();
              }
            }
            await expectValue(n);
            expect(container.querySelector("section")).toBe(section);
            if (kind === "static" && optimistic) {
              let settle!: () => void;
              const gate = new Promise<void>(resolve => {
                settle = resolve;
              });
              const pending = action(function* () {
                current.update();
                yield gate;
              })();
              try {
                await expectValue(1);
              } finally {
                settle();
                await pending;
              }
              await expectValue(0);
            } else {
              current.update();
              await expectValue(n + 1);
              await current.refresh();
              await expectValue(n + (kind === "static" ? 1 : 2));
            }
            expect(warn).not.toHaveBeenCalled();
          } finally {
            if (kind === "hybrid") releaseHybrid?.();
            dispose?.();
            await sleep(0);
            warn.mockRestore();
            container.remove();
          }
        });
      }
});
