/** @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { action, flush } from "solid-js";
import { hydrate } from "@solidjs/web";
import { WeakTokenFixture, kinds, current } from "./fixtures/weak-collections.js";
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
function apply(container: Element, chunk: string, first: boolean) {
  const pattern = /<script(?:[^>]*)>([\s\S]*?)<\/script>/g;
  const scripts = [...chunk.matchAll(pattern)].map(m => m[1]!);
  const markup = chunk.replace(pattern, "");
  if (first) container.innerHTML = markup;
  else container.insertAdjacentHTML("beforeend", markup);
  for (const script of scripts) (0, eval)(script);
}
describe("real weak token projection hydration", () => {
  for (const kind of kinds)
    for (const optimistic of [false, true])
      for (const mode of ["loaded", "streamed"]) {
        it(`${kind}, optimistic=${optimistic}, ${mode}`, async () => {
          const artifact = JSON.parse(
            readFileSync(
              resolve(`node_modules/.cache/weak-ssr/${kind}-${optimistic}.json`),
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
              await expectValue(1);
              settle();
              await pending;
              await expectValue(0);
            } else {
              current.update();
              await expectValue(n + 1);
              await current.refresh();
              await expectValue(n + 1);
            }
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
