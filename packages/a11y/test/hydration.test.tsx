import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// createFormControl backs its labelId/fieldId/descriptionId/errorMessageId with
// createSignal(undefined, { ownedWrite: true }) internal signals created in the render body —
// the same class of construct hope-ui's solid-primitives-eval.md flags as a hydration-id hazard.
// Renders through the real, standard @solidjs/web renderToString + hydrate pipeline (not our own
// SSR harness) with the package resolved from its published `dist` build.
const APP_SOURCE = `
import { createFormControl, FormControlContext } from "@solid-primitives/a11y";

export default function App() {
  const ctx = createFormControl({ id: "email", required: true });
  ctx.registerLabel("email-label");

  return (
    <FormControlContext value={ctx}>
      <div id="out">
        <label id="email-label">Email</label>
        <input
          id="email-input"
          aria-labelledby={ctx.getAriaLabelledBy("email-input", undefined, undefined)}
          aria-describedby={ctx.getAriaDescribedBy(undefined)}
          data-required={ctx.dataset()["data-required"]}
        />
      </div>
    </FormControlContext>
  );
}
`;

describe("createFormControl hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the required dataset attribute", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain('data-required=""');
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates the DOM with the correct aria attributes", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    const input = result.container.querySelector("#email-input");
    expect(input?.getAttribute("aria-labelledby")).toBe("email-label");
    expect(input?.getAttribute("data-required")).toBe("");
  });
});
