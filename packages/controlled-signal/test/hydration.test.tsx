import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// `createControllableSignal` backs its state with a compute-form `createSignal(fn, { ownedWrite: true })`
// created in the component's render body — exactly the pattern hope-ui's solid-primitives-eval.md flags
// as a hydration-id hazard when the primitive lives in an un-transformed node_modules dependency. This
// renders through the real, standard @solidjs/web renderToString + hydrate pipeline (not our own SSR
// harness) with the package resolved from its published `dist` build, to check whether that hazard
// actually reproduces here.
const APP_SOURCE = `
import { createControllableSignal } from "@solid-primitives/controlled-signal";

export default function App() {
  const [value] = createControllableSignal<string>({ defaultValue: () => "hello" });
  return (
    <div id="out" data-testid="out">
      <span>{value()}</span>
      <button type="button">toggle</button>
    </div>
  );
}
`;

describe("createControllableSignal hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the defaultValue", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain("hello");
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates the DOM into an interactive tree with the correct value", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    const span = result.container.querySelector("span");
    expect(span?.textContent).toBe("hello");
  });
});
