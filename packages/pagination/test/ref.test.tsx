import { describe, it, expect, afterEach } from "vitest";
import { createSignal, flush, Show } from "solid-js";
import { render } from "@solidjs/web";
import { createInfiniteScroll } from "../src/index.js";

// Regression for #1143: a ref callback may not call onCleanup, so the loader must not.

class MockIO {
  static instances: MockIO[] = [];
  observed = new Set<Element>();
  disconnected = false;
  constructor(public callback: IntersectionObserverCallback) {
    MockIO.instances.push(this);
  }
  observe(el: Element) {
    this.observed.add(el);
  }
  unobserve(el: Element) {
    this.observed.delete(el);
  }
  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }
  trigger() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as never);
  }
}
//@ts-ignore
global.IntersectionObserver = MockIO;

let unmounts: Array<() => void> = [];
function mount(App: () => any) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const dispose = render(App, container);
  const unmount = () => {
    dispose();
    container.remove();
  };
  unmounts.push(unmount);
  return { container, unmount };
}
afterEach(() => {
  unmounts.forEach(u => u());
  unmounts = [];
  MockIO.instances = [];
});

const fetcher = async (page: number) => [page];
const settle = async () => {
  flush();
  await Promise.resolve();
  await Promise.resolve();
  flush();
};

describe("createInfiniteScroll as a JSX ref", () => {
  it("observes a plain div ref, advances on intersect, disconnects on dispose", async () => {
    let count!: () => number;
    const { container, unmount } = mount(() => {
      const [, loader, { pageCount }] = createInfiniteScroll(fetcher);
      count = pageCount;
      return <div id="s" ref={loader} />;
    });
    const io = MockIO.instances.at(-1)!;
    expect(io.observed.has(container.querySelector("#s")!)).toBe(true);
    await settle();
    io.trigger();
    flush();
    expect(count()).toBe(2);
    unmount();
    expect(io.disconnected).toBe(true);
    expect(io.observed.size).toBe(0);
  });

  it("mounts the README usage inside Show and observes the re-mounted sentinel", () => {
    let setShow!: (v: boolean) => void;
    const { container, unmount } = mount(() => {
      const [show, set] = createSignal(true);
      setShow = set;
      const [, loader] = createInfiniteScroll(fetcher);
      return (
        <Show when={show()}>
          <div id="s" ref={loader} />
        </Show>
      );
    });
    const io = MockIO.instances.at(-1)!;
    expect(io.observed.has(container.querySelector("#s")!)).toBe(true);
    setShow(false);
    flush();
    setShow(true);
    flush();
    expect(io.observed.has(container.querySelector("#s")!)).toBe(true);
    unmount();
    expect(io.disconnected).toBe(true);
  });

  it("unobserves a replaced sentinel and tears down via the returned cleanup", () => {
    let loader!: (el: Element) => void | (() => void);
    mount(() => {
      loader = createInfiniteScroll(fetcher)[1];
      return <div />;
    });
    const io = MockIO.instances.at(-1)!;
    const a = document.createElement("div");
    const b = document.createElement("div");
    const cleanupA = loader(a) as () => void;
    loader(b);
    expect(io.observed.has(a)).toBe(false);
    expect(io.observed.has(b)).toBe(true);
    cleanupA();
    expect(io.observed.has(b)).toBe(true);
  });

  it("returned teardown unobserves the element and is idempotent", () => {
    let loader!: (el: Element) => void | (() => void);
    mount(() => {
      loader = createInfiniteScroll(fetcher)[1];
      return <div />;
    });
    const io = MockIO.instances.at(-1)!;
    const el = document.createElement("div");
    const teardown = loader(el) as () => void;
    expect(io.observed.has(el)).toBe(true);
    teardown();
    teardown();
    expect(io.observed.has(el)).toBe(false);
  });
});
