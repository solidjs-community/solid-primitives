import { describe, expect, it } from "vitest";

import { render } from "@solidjs/testing-library";

import { createInputMask, createMaskPattern } from "../src/index";

const dispatchInputEvent = (node: HTMLElement) =>
  new Promise<void>(resolve => {
    node.addEventListener("input", () => resolve(), { once: true });
    node.dispatchEvent(new Event("input", { bubbles: true, cancelable: false }));
  });

describe("createInputMask", () => {
  it("adds placeholder (e.g. to an iso date)", async () => {
    const { container } = render(() => <input onInput={createInputMask("9999-99-99")} />);
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
  });

  it("removes wrongful input (e.g. from iso-date)", async () => {
    const { container } = render(() => <input onInput={createInputMask("9999-99-99")} />);
    const input = container.querySelector("input") as HTMLInputElement;
    input.value = "a";
    await dispatchInputEvent(input);
    expect(input.value).toBe("");
    input.value = "-";
    await dispatchInputEvent(input);
    expect(input.value).toBe("");
  });

  it("works with regex mask", async () => {
    const { container } = render(() => (
      <input
        onInput={createInputMask([
          /[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi,
          () => "",
        ])}
      />
    ));
    const input = container.querySelector("input") as HTMLInputElement;
    input.value = "https://meet.goto.com/test";
    await dispatchInputEvent(input);
    expect(input.value).toBe("test");
  });
});

describe("createMaskPattern", () => {
  it("adds data-mask-value and data-mask-pattern to the previous element", async () => {
    const { container } = render(() => (
      <div>
        <label></label>
        <input
          placeholder="YYYY-MM-DD"
          onInput={createMaskPattern(createInputMask("9999-99-99"), () => "YYYY-MM-DD")}
        />
      </div>
    ));
    const label = container.querySelector("label")!;
    const input = container.querySelector("input")!;
    expect(label.hasAttribute("data-mask-value")).toBe(false);
    expect(label.hasAttribute("data-mask-pattern")).toBe(false);
    input.value = "1";
    await dispatchInputEvent(input);
    expect(label.getAttribute("data-mask-value")).toBe("1");
    expect(label.getAttribute("data-mask-pattern")).toBe("YYY-MM-DD");
    input.value = "20771";
    await dispatchInputEvent(input);
    expect(label.getAttribute("data-mask-value")).toBe("2077-1");
    expect(label.getAttribute("data-mask-pattern")).toBe("M-DD");
  });
});
