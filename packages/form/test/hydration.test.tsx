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

// Regression for https://github.com/solidjs-community/solid-primitives/issues/1143: the README
// usage threw CLEANUP_IN_FORBIDDEN_SCOPE from the `ref` callbacks, which aborted hydration. The
// form's submit handler was then never attached, so submitting navigated with the fields in the URL.
const REF_APP_SOURCE = `
import { createForm } from "@solid-primitives/form";

export default function App() {
  const form = createForm({ fields: { email: { initial: "" } } });
  return (
    <form id="out" ref={form.ref}>
      <input id="email" ref={form.bind("email")} />
      <span id="value">{form.fields.email.value()}</span>
      <button type="submit">Send</button>
    </form>
  );
}
`;

describe("createForm ref callbacks during hydration", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("hydrates the documented ref usage without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(REF_APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("claims the server-rendered nodes and attaches the submit listener", async () => {
    result = await renderHydrationRoundTrip(REF_APP_SOURCE, import.meta.dirname);
    const form = result.container.querySelector("form")!;
    const button = result.container.querySelector("button")!;
    expect(form.isConnected).toBe(true);
    expect(button.isConnected).toBe(true);

    // the listener is attached: a native submit is intercepted instead of navigating
    const event = new Event("submit", { cancelable: true, bubbles: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("wires the input to the field after hydration", async () => {
    result = await renderHydrationRoundTrip(REF_APP_SOURCE, import.meta.dirname);
    const input = result.container.querySelector<HTMLInputElement>("#email")!;
    input.value = "ada@example.com";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await Promise.resolve();
    expect(result.container.querySelector("#value")!.textContent).toBe("ada@example.com");
  });
});
