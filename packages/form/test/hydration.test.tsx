import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// createForm backs every field with render-body createMemo calls (the displayed error, the raw
// error, the validator error), plus form-level ones (values, errors, dirty, pending, valid).
// Elements rendered after the form in the same component must still find their server-rendered
// twins.
const APP_SOURCE = `
import { createForm } from "@solid-primitives/form";

const required = (v: string) => (v ? null : "Required");

export default function App() {
  const form = createForm({
    fields: {
      email: { initial: "", validate: required },
      name: { initial: "Ada" },
    },
  });
  return (
    <form id="out">
      <input value={form.fields.email.value()} />
      <span id="error">{form.fields.email.error()}</span>
      <button type="submit" disabled={!form.valid()}>Send</button>
    </form>
  );
}
`;

describe("createForm hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the form", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain("<form");
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates the elements after the form in place", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    const button = result.container.querySelector("button");
    expect(button?.isConnected).toBe(true);
    expect(button?.disabled).toBe(true);
  });
});
