import { describe, test, expect } from "vitest";
import { VirtualList } from "../src/index.jsx";
import { render } from "solid-js/web";

const TEST_LIST = Array.from({ length: 1000 }, (_, i) => i);

const SELECTOR_CLASS_NAME = "scroll-container-selector";

const SCROLL_EVENT = new Event("scroll");

let root = document.createElement("div");

function getScrollContainer() {
  const scrollContainer = root.querySelector("." + SELECTOR_CLASS_NAME);
  if (scrollContainer === null) {
    throw "." + SELECTOR_CLASS_NAME + " was not found";
  }
  return scrollContainer;
}

describe("VirtualList", () => {
  test("renders a subset of the items", () => {
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

  test("renders the correct subset of the items based on scrolling", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      root,
    );

    const scrollContainer = getScrollContainer();

    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).toBeNull();

    scrollContainer.scrollTop += 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).not.toBeNull();
    expect(root.querySelector("#item-4")).toBeNull();

    scrollContainer.scrollTop += 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).not.toBeNull();
    expect(root.querySelector("#item-4")).not.toBeNull();
    expect(root.querySelector("#item-5")).toBeNull();

    scrollContainer.scrollTop -= 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-0")).not.toBeNull();
    expect(root.querySelector("#item-1")).not.toBeNull();
    expect(root.querySelector("#item-2")).not.toBeNull();
    expect(root.querySelector("#item-3")).not.toBeNull();
    expect(root.querySelector("#item-4")).toBeNull();

    scrollContainer.scrollTop -= 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

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

    const scrollContainer = getScrollContainer();

    scrollContainer.scrollTop += 9_980;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-996")).toBeNull();
    expect(root.querySelector("#item-997")).not.toBeNull();
    expect(root.querySelector("#item-998")).not.toBeNull();
    expect(root.querySelector("#item-999")).not.toBeNull();
    expect(root.querySelector("#item-1000")).toBeNull();

    dispose();
  });

  test("renders `overscanCount` rows above and below the visible rendered items", () => {
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

    const scrollContainer = getScrollContainer();

    scrollContainer.scrollTop += 100;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

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

    const scrollContainer = getScrollContainer();

    scrollContainer.scrollTop += 100;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

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

    const scrollContainer = getScrollContainer();

    scrollContainer.scrollTop += 100;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(root.querySelector("#item-8")).toBeNull();
    expect(root.querySelector("#item-9")).not.toBeNull();
    expect(root.querySelector("#item-10")).not.toBeNull();
    expect(root.querySelector("#item-11")).not.toBeNull();
    expect(root.querySelector("#item-12")).not.toBeNull();
    expect(root.querySelector("#item-13")).toBeNull();

    dispose();
  });
});
