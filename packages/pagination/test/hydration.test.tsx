import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// createPagination backs its return value with several render-body createMemo calls
// (opts, page, pages, start/showFirst/showPrev/showNext/showLast, paginationProps) — the same
// class of construct hope-ui's solid-primitives-eval.md flags as a hydration-id hazard, and the
// single most memo-heavy example across the packages that pattern was found in. Renders through
// the real, standard @solidjs/web renderToString + hydrate pipeline with the package resolved
// from its published `dist` build.
const APP_SOURCE = `
import { createPagination } from "@solid-primitives/pagination";
import { For } from "solid-js";

export default function App() {
  const [paginationProps] = createPagination({ pages: 5, initialPage: 2 });
  return (
    <nav id="out">
      <For each={paginationProps()}>{props => <button {...props} />}</For>
    </nav>
  );
}
`;

describe("createPagination hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the pagination buttons", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain("<button");
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates the DOM with the correct current-page button marked aria-current", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    const current = result.container.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe("2");
  });
});
