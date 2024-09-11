import { describe, expect, it } from "vitest";
import { render } from "solid-js/web";
import { createInputMask, createMaskPattern } from "../src/index.js";

const dispatchInputEvent = (node: HTMLElement) => {
  node.dispatchEvent(new Event("input", { bubbles: true, cancelable: false }));
};

describe("createInputMask", () => {
  it("adds placeholder (e.g. to an iso date)", () => {
    let input!: HTMLInputElement;
    let dispose = render(
      () => <input ref={input} onInput={createInputMask("9999-99-99")} />,
      document.body,
    );
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
    dispose();
  });

  it("removes wrongful input (e.g. from iso-date)", () => {
    let input!: HTMLInputElement;
    let dispose = render(
      () => <input ref={input} onInput={createInputMask("9999-99-99")} />,
      document.body,
    );
    input.value = "a";
    dispatchInputEvent(input);
    expect(input.value).toBe("");
    input.value = "-";
    dispatchInputEvent(input);
    expect(input.value).toBe("");
    dispose();
  });

  it("works with regex mask", () => {
    let input!: HTMLInputElement;
    let dispose = render(
      () => (
        <input
          ref={input}
          onInput={createInputMask([
            /[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi,
            () => "",
          ])}
        />
      ),
      document.body,
    );
    input.value = "https://meet.goto.com/test";
    dispatchInputEvent(input);
    expect(input.value).toBe("test");
    dispose();
  });
});

describe("createMaskPattern", () => {
  it("adds data-mask-value and data-mask-pattern to the previous element", () => {
    let input!: HTMLInputElement;
    let label!: HTMLLabelElement;
    let dispose = render(
      () => (
        <div>
          <label ref={label}></label>
          <input
            ref={input}
            placeholder="YYYY-MM-DD"
            onInput={createMaskPattern(createInputMask("9999-99-99"), () => "YYYY-MM-DD")}
          />
        </div>
      ),
      document.body,
    );
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
    dispose();
  });
});
