import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// createMachine backs its return value with a render-body createMemo — the same class of
// construct hope-ui's solid-primitives-eval.md flags as a hydration-id hazard. Renders through
// the real, standard @solidjs/web renderToString + hydrate pipeline with the package resolved
// from its published `dist` build.
const APP_SOURCE = `
import { createMachine } from "@solid-primitives/state-machine";

export default function App() {
  const state = createMachine({
    initial: "idle",
    states: {
      idle: () => "foo",
      loading: () => "bar",
    },
  });
  return (
    <div id="out">
      <span id="type">{state().type}</span>
      <span id="value">{state().value}</span>
    </div>
  );
}
`;

describe("createMachine hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the initial state", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain("foo");
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates the DOM with the correct initial state", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.container.querySelector("#type")?.textContent).toBe("idle");
    expect(result.container.querySelector("#value")?.textContent).toBe("foo");
  });
});
