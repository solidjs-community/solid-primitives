import { afterEach, describe, expect, it } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// Both primitives create a `createDeferred` compute in the component's render
// body, so they consume a hydration slot like any other derived value. Make
// sure the server and client allocate the same nodes, including a sibling that
// follows them.
const APP_SOURCE = `
import { createSignal } from "solid-js";
import { createDebounced, createThrottled } from "@solid-primitives/scheduled";

export default function App() {
  const [text] = createSignal("hello");
  const debounced = createDebounced(text, 100);
  const throttled = createThrottled(text, 100);

  return (
    <div id="out">
      <span id="debounced">{debounced()}</span>
      <span id="throttled">{throttled()}</span>
      <button type="button">after</button>
    </div>
  );
}
`;

describe("derived scheduled accessors hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the initial values", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain("hello");
    expect(result.html).toContain("after");
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates both values into the correct elements", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.container.querySelector("#debounced")?.textContent).toBe("hello");
    expect(result.container.querySelector("#throttled")?.textContent).toBe("hello");
  });
});
