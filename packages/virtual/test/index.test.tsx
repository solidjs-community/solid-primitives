import { describe, test, expect } from "vitest";
import { VirtualList } from "../src/index.jsx";
import { render } from "solid-js/web";

const TEST_LIST = Array.from({ length: 1000 }, (_, i) => i);

const SELECTOR_CLASS_NAME = "scroll-container-selector";

const SCROLL_EVENT = new Event("scroll");

let root = document.createElement("div");

function get_scroll_continer() {
  const scroll_container = root.querySelector("." + SELECTOR_CLASS_NAME);
  if (scroll_container == null) {
    throw "." + SELECTOR_CLASS_NAME + " was not found";
  }
  return scroll_container;
}

describe("VirtualList", () => {
  test("renders a subset of the items", () => {
    let root = document.createElement("div");
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).toBeNull();

    dispose();
  });

  test("scrolling renders the correct subset of the items", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );
    const scroll_container = get_scroll_continer();

    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).toBeNull();

    scroll_container.scrollTop += 10;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).not.toBeNull();
    expect(root.querySelector("#item-4")).toBeNull();

    scroll_container.scrollTop += 10;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).not.toBeNull();
    expect(root.querySelector("#item-4")).not.toBeNull();
    expect(root.querySelector("#item-5")).toBeNull();

    scroll_container.scrollTop -= 10;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).not.toBeNull();
    expect(root.querySelector("#item-4")).toBeNull();

    scroll_container.scrollTop -= 10;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).toBeNull();

    dispose();
  });

  test("renders the correct subset of the items for the end of the list", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );
    const scroll_container = get_scroll_continer();

    scroll_container.scrollTop += 9_980;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-996")).toBeNull();
    expect(root.querySelector("#item-997")).not.toBeNull();
    expect(root.querySelector("#item-998")).not.toBeNull();
    expect(root.querySelector("#item-999")).not.toBeNull();
    expect(root.querySelector("#item-1000")).toBeNull();

    dispose();
  });

  test("renders `overScan` rows above and below the visible rendered items", () => {
    const dispose = render(
      () => (
        <VirtualList
          each={TEST_LIST}
          rootHeight={20}
          rowHeight={10}
          overscanCount={2}
          class={SELECTOR_CLASS_NAME}
        >
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );
    const scroll_container = get_scroll_continer();

    scroll_container.scrollTop += 100;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-7")).toBeNull();
    expect(root.querySelector("#item-8")).not.toBeNull();
    expect(root.querySelector("#item-9")).not.toBeNull();
    expect(root.querySelector("#item-10")).not.toBeNull();
    expect(root.querySelector("#item-11")).not.toBeNull();
    expect(root.querySelector("#item-12")).not.toBeNull();
    expect(root.querySelector("#item-13")).not.toBeNull();
    expect(root.querySelector("#item-14")).toBeNull();

    dispose();
  });

  test("overscanCount defaults to 1 if undefined", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );
    const scroll_container = get_scroll_continer();

    scroll_container.scrollTop += 100;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-8")).toBeNull();
    expect(root.querySelector("#item-9")).not.toBeNull();
    expect(root.querySelector("#item-10")).not.toBeNull();
    expect(root.querySelector("#item-11")).not.toBeNull();
    expect(root.querySelector("#item-12")).not.toBeNull();
    expect(root.querySelector("#item-13")).toBeNull();

    dispose();
  });

  test("overscanCount defaults to 1 if set to zero", () => {
    const dispose = render(
      () => (
        <VirtualList
          each={TEST_LIST}
          rootHeight={20}
          rowHeight={10}
          overscanCount={0}
          class={SELECTOR_CLASS_NAME}
        >
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );
    const scroll_container = get_scroll_continer();

    scroll_container.scrollTop += 100;
    scroll_container.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-8")).toBeNull();
    expect(root.querySelector("#item-9")).not.toBeNull();
    expect(root.querySelector("#item-10")).not.toBeNull();
    expect(root.querySelector("#item-11")).not.toBeNull();
    expect(root.querySelector("#item-12")).not.toBeNull();
    expect(root.querySelector("#item-13")).toBeNull();

    dispose();
  });
});
