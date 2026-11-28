import { describe, it, expect, vi, afterEach } from "vitest";
import { createRoot, flush } from "solid-js";
import { render } from "@solidjs/web";
import { mutationObserver } from "../src/index.js";

// Regression for #1143: mounts real JSX refs with the real (jsdom) MutationObserver.

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

const tick = () => new Promise<void>(r => setTimeout(r, 0));

afterEach(() => {
  disposers.forEach(d => d());
  disposers = [];
});

describe("mutationObserver as a JSX ref", () => {
  it("mounts inside a component and reports childList mutations", async () => {
    const cb = vi.fn();
    const { container } = mount(() => <div ref={mutationObserver({ childList: true }, cb)} />);
    flush();
    container.firstElementChild!.appendChild(document.createElement("span"));
    await tick();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0]![0][0].type).toBe("childList");
  });

  it("reports attribute mutations", async () => {
    const cb = vi.fn();
    const { container } = mount(() => <div ref={mutationObserver({ attributes: true }, cb)} />);
    flush();
    container.firstElementChild!.setAttribute("data-x", "1");
    await tick();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb.mock.calls[0]![0][0].attributeName).toBe("data-x");
  });

  it("works in a ref array", async () => {
    const cb = vi.fn();
    const other = vi.fn();
    const { container } = mount(() => (
      <div ref={[other, mutationObserver({ childList: true }, cb)]} />
    ));
    flush();
    expect(other).toHaveBeenCalledTimes(1);
    container.firstElementChild!.appendChild(document.createElement("i"));
    await tick();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("one factory value observes several targets", async () => {
    const cb = vi.fn();
    const { container } = mount(() => {
      const ref = mutationObserver({ childList: true }, cb);
      return (
        <>
          <div ref={ref} />
          <p ref={ref} />
        </>
      );
    });
    flush();
    for (const el of Array.from(container.children)) el.appendChild(document.createElement("b"));
    await tick();
    const targets = cb.mock.calls.flatMap(c => c[0].map((r: MutationRecord) => r.target));
    expect(new Set(targets).size).toBe(2);
  });

  it("does not throw when created outside any owner", async () => {
    const cb = vi.fn();
    const ref = mutationObserver({ childList: true }, cb);
    const el = document.createElement("div");
    expect(() => ref(el)).not.toThrow();
    el.appendChild(document.createElement("span"));
    await tick();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("stops observing when the owner is disposed", async () => {
    const cb = vi.fn();
    const el = document.createElement("div");
    const dispose = createRoot(d => {
      mutationObserver({ childList: true }, cb)(el);
      return d;
    });
    flush();
    dispose();
    el.appendChild(document.createElement("span"));
    await tick();
    expect(cb).not.toHaveBeenCalled();
  });

  it("stops observing after unmount", async () => {
    const cb = vi.fn();
    const { container, unmount } = mount(() => (
      <div ref={mutationObserver({ childList: true }, cb)} />
    ));
    flush();
    const el = container.firstElementChild!;
    unmount();
    el.appendChild(document.createElement("span"));
    await tick();
    expect(cb).not.toHaveBeenCalled();
  });
});
