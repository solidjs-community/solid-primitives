import { describe, it, expect, vi, afterEach } from "vitest";
import { render } from "@solidjs/web";
import { focus } from "../src/index.js";

// Regression for #1143: focus() must work as a real JSX ref, where onCleanup is forbidden.

let disposers: Array<() => void> = [];

function mount(App: () => any) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(App, container);
  const unmount = () => {
    dispose();
    container.remove();
  };
  disposers.push(unmount);
  return { container, unmount };
}

afterEach(() => {
  disposers.forEach(d => d());
  disposers = [];
});

const fire = (el: Element, type: "focus" | "blur") => el.dispatchEvent(new FocusEvent(type));

describe("focus as a JSX ref callback", () => {
  it("mounts a static ref without throwing and reports focus changes", () => {
    const cb = vi.fn();
    let container!: HTMLElement;
    expect(() => {
      ({ container } = mount(() => <input ref={focus(cb)} />));
    }).not.toThrow();
    const input = container.querySelector("input")!;
    expect(cb).toHaveBeenLastCalledWith(false);
    fire(input, "focus");
    expect(cb).toHaveBeenLastCalledWith(true);
    fire(input, "blur");
    expect(cb).toHaveBeenLastCalledWith(false);
  });

  it("works inside an array of refs", () => {
    const cb = vi.fn();
    const other = vi.fn();
    const { container } = mount(() => <input ref={[focus(cb), other]} />);
    const input = container.querySelector("input")!;
    expect(other).toHaveBeenCalledWith(input);
    fire(input, "focus");
    expect(cb).toHaveBeenLastCalledWith(true);
  });

  it("keeps per-element state when one focus() value is attached to two elements", () => {
    const cb = vi.fn();
    const { container, unmount } = mount(() => {
      const f = focus(cb);
      return (
        <div>
          <input id="a" ref={f} />
          <input id="b" ref={f} />
        </div>
      );
    });
    const a = container.querySelector("#a")!;
    const b = container.querySelector("#b")!;
    cb.mockClear();
    fire(a, "focus");
    fire(b, "focus");
    expect(cb).toHaveBeenCalledTimes(2);
    unmount();
    cb.mockClear();
    fire(a, "focus");
    fire(b, "focus");
    expect(cb).not.toHaveBeenCalled();
  });

  it("removes listeners when the owner is disposed", () => {
    const cb = vi.fn();
    const { container, unmount } = mount(() => <input ref={focus(cb)} />);
    const input = container.querySelector("input")!;
    unmount();
    cb.mockClear();
    fire(input, "focus");
    fire(input, "blur");
    expect(cb).not.toHaveBeenCalled();
  });

  it("does not throw without an owner and returns a teardown", () => {
    const cb = vi.fn();
    const el = document.createElement("input");
    const ref = focus(cb) as (t: Element) => unknown;
    const teardown = ref(el) as () => void;
    fire(el, "focus");
    expect(cb).toHaveBeenLastCalledWith(true);
    teardown();
    teardown();
    cb.mockClear();
    fire(el, "focus");
    expect(cb).not.toHaveBeenCalled();
  });
});
