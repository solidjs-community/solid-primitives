/** @vitest-environment jsdom */
import { expect, it } from "vitest";
import { createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";
import { Button } from "../../../.storybook/ui/controls.tsx";

it("renders the explicit pressed state and omits unspecified state", () => {
  const [pressed, update] = createSignal<boolean | undefined>(false);
  const container = document.createElement("div");
  const dispose = render(() => <Button aria-pressed={pressed()}>Toggle</Button>, container);
  try {
    const button = container.querySelector("button")!;
    expect(button.getAttribute("aria-pressed")).toBe("false");
    update(true);
    flush();
    expect(button.getAttribute("aria-pressed")).toBe("true");
    update(undefined);
    flush();
    expect(button.hasAttribute("aria-pressed")).toBe(false);
  } finally {
    dispose();
  }
});
