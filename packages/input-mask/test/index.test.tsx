import { describe, expect, it } from "vitest";
import { createInputMask, createMaskPattern } from "../src/index.js";

const dispatchInputEvent = (node: HTMLElement) => {
  node.dispatchEvent(new Event("input", { bubbles: true, cancelable: false }));
};

describe("createInputMask", () => {
  it("adds placeholder (e.g. to an iso date)", () => {
    const input = document.createElement("input");
    const mask = createInputMask("9999-99-99");
    input.addEventListener("input", mask as EventListener);
    document.body.appendChild(input);

    input.value = "11111";
    dispatchInputEvent(input);
    expect(input.value).toBe("1111-1");
    input.value = "1111-11";
    dispatchInputEvent(input);
    expect(input.value).toBe("1111-11");
    input.value = "1111-111";
    dispatchInputEvent(input);
    expect(input.value).toBe("1111-11-1");
    input.value = "1111-11-11";
    dispatchInputEvent(input);
    expect(input.value).toBe("1111-11-11");
    input.value = "1111-11-111";
    dispatchInputEvent(input);
    expect(input.value).toBe("1111-11-11");

    input.remove();
  });

  it("removes wrongful input (e.g. from iso-date)", () => {
    const input = document.createElement("input");
    const mask = createInputMask("9999-99-99");
    input.addEventListener("input", mask as EventListener);
    document.body.appendChild(input);

    input.value = "a";
    dispatchInputEvent(input);
    expect(input.value).toBe("");
    input.value = "-";
    dispatchInputEvent(input);
    expect(input.value).toBe("");

    input.remove();
  });

  it("works with regex mask", () => {
    const input = document.createElement("input");
    const mask = createInputMask([
      /[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi,
      () => "",
    ]);
    input.addEventListener("input", mask as EventListener);
    document.body.appendChild(input);

    input.value = "https://meet.goto.com/test";
    dispatchInputEvent(input);
    expect(input.value).toBe("test");

    input.remove();
  });
});

describe("createMaskPattern", () => {
  it("adds data-mask-value and data-mask-pattern to the previous element", () => {
    const div = document.createElement("div");
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.placeholder = "YYYY-MM-DD";
    const mask = createMaskPattern(createInputMask("9999-99-99"), () => "YYYY-MM-DD");
    input.addEventListener("input", mask as EventListener);
    div.appendChild(label);
    div.appendChild(input);
    document.body.appendChild(div);

    expect(label.hasAttribute("data-mask-value")).toBe(false);
    expect(label.hasAttribute("data-mask-pattern")).toBe(false);
    input.value = "1";
    dispatchInputEvent(input);
    expect(label.getAttribute("data-mask-value")).toBe("1");
    expect(label.getAttribute("data-mask-pattern")).toBe("YYY-MM-DD");
    input.value = "20771";
    dispatchInputEvent(input);
    expect(label.getAttribute("data-mask-value")).toBe("2077-1");
    expect(label.getAttribute("data-mask-pattern")).toBe("M-DD");

    div.remove();
  });
});
