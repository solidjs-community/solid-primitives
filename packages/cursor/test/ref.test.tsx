import { describe, it, expect, afterEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import { render } from "@solidjs/web";
import { cursorRef, type CursorProperty } from "../src/index.js";

// Regression for #1143: cursorRef must work as a real JSX ref (no primitives created in the callback).

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

describe("cursorRef as a JSX ref", () => {
  it("applies a static cursor and restores it on unmount", () => {
    const { container, unmount } = mount(() => (
      <div ref={cursorRef("pointer")} style={{ cursor: "text" }} />
    ));
    flush();
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.cursor).toBe("pointer");
    unmount();
    expect(el.style.cursor).toBe("text");
  });

  it("follows a reactive cursor", () => {
    const [cursor, setCursor] = createSignal<CursorProperty>("pointer");
    const { container } = mount(() => <div ref={cursorRef(cursor)} />);
    flush();
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.cursor).toBe("pointer");
    setCursor("help");
    flush();
    expect(el.style.cursor).toBe("help");
  });

  it("supports one cursorRef value on several elements", () => {
    const { container, unmount } = mount(() => {
      const ref = cursorRef("grab");
      return (
        <>
          <div ref={ref} />
          <span ref={ref} />
        </>
      );
    });
    flush();
    const [a, b] = Array.from(container.children) as HTMLElement[];
    expect(a.style.cursor).toBe("grab");
    expect(b.style.cursor).toBe("grab");
    unmount();
    expect(a.style.cursor).toBe("");
    expect(b.style.cursor).toBe("");
  });

  it("does not throw when evaluated outside an owner", () => {
    const el = document.createElement("div");
    let teardown: unknown;
    expect(() => {
      teardown = cursorRef("pointer")(el);
    }).not.toThrow();
    if (typeof teardown === "function") teardown();
  });

  it("restores when the owner is disposed directly", () => {
    const el = document.createElement("div");
    const dispose = createRoot(d => {
      cursorRef("wait")(el);
      return d;
    });
    flush();
    expect(el.style.cursor).toBe("wait");
    dispose();
    expect(el.style.cursor).toBe("");
  });
});
