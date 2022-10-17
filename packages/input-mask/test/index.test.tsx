import { describe, expect, it } from "vitest";

import { render } from "solid-js/web";

import { createInputMask } from "../src/index";
import type { JSX } from "solid-js";

describe("createInputMask", () => {
  const renderTest = (testCase: () => JSX.Element) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const unmount = render(testCase, container);
    return { container, unmount: () => {
      unmount();
      document.body.removeChild(container);
    } };
  };

  const dispatchInputEvent = (node: HTMLElement) =>
    new Promise<void>(resolve => {
      node.addEventListener("input", () => resolve(), { once: true });
      node.dispatchEvent(new Event("input", { bubbles: true, cancelable: false }));
    });

  it("adds placeholder (e.g. to an iso date)", async () => {
    const { container, unmount } = renderTest(() => <input onInput={createInputMask("9999-99-99")} />);
    const input = container.querySelector("input") as HTMLInputElement;
    input.value = "11111";
    await dispatchInputEvent(input);
    expect(input.value).toBe("1111-1");
    input.value = "1111-11";
    await dispatchInputEvent(input);
    expect(input.value).toBe("1111-11");
    input.value = "1111-111";
    await dispatchInputEvent(input);
    expect(input.value).toBe("1111-11-1");
    input.value = "1111-11-11";
    await dispatchInputEvent(input);
    expect(input.value).toBe("1111-11-11");
    input.value = "1111-11-111";
    await dispatchInputEvent(input);
    expect(input.value).toBe("1111-11-11");
    unmount();
  });

  it("removes wrongful input (e.g. from iso-date)", async () => {
    const { container, unmount } = renderTest(() => <input onInput={createInputMask("9999-99-99")} />);
    const input = container.querySelector("input") as HTMLInputElement;
    input.value = "a";
    await dispatchInputEvent(input);
    expect(input.value).toBe("");
    input.value = "-";
    await dispatchInputEvent(input);
    expect(input.value).toBe("");
    unmount();
  });

  it("works with regex mask", async () => {
    const { container, unmount } = renderTest(
      () => (
        <input
          onInput={createInputMask([
            /[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi,
            () => ""
          ])}
        />
      )
    );
    const input = container.querySelector("input") as HTMLInputElement;
    input.value = "https://meet.goto.com/test";
    await dispatchInputEvent(input);
    expect(input.value).toBe("test");
    unmount();
  });
});
