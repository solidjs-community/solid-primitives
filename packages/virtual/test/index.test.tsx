import { describe, test, expect } from "vitest";
import { render } from "solid-js/web";
import { DOMElement } from "solid-js/jsx-runtime";

import { createVirtualList, VirtualList } from "../src/index.jsx";

const TEST_LIST = Array.from({ length: 1000 }, (_, i) => i);

const ROOT = document.createElement("div");

const SCROLL_EVENT = new Event("scroll");

const TARGETED_SCROLL_EVENT = (el: DOMElement) => ({ ...SCROLL_EVENT, target: el });

function getScrollContainer() {
  const scrollContainer = ROOT.querySelector("div");
  if (scrollContainer === null) {
    throw "scrollContainer not found";
  }
  return scrollContainer;
}

describe("createVirtualList", () => {
  test("returns containerHeight representing the size of the list container element within the root", () => {
    const [virtual] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().containerHeight).toEqual(10_000);
  });

  test("returns viewerTop representing the location of the list viewer element within the list container", () => {
    const [virtual] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().viewerTop).toEqual(0);
  });

  test("returns visibleList representing the subset of items to render", () => {
    const [virtual] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().visibleItems).toEqual([0, 1, 2]);
  });

  test("returns firstIndex representing the first index of the visibleList", () => {
    const [virtual] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().firstIndex).toEqual(0);
  });

  test("returns lastIndex representing the last item in the visibleList's index", () => {
    const [virtual] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().lastIndex).toEqual(2);
  });

  test("returns onScroll which sets viewerTop and visibleItems based on rootElement's scrolltop", () => {
    const el = document.createElement("div");

    const [virtual, onScroll] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().visibleItems).toEqual([0, 1, 2]);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(2);

    el.scrollTop += 10;

    // no change until onScroll is called
    expect(virtual().visibleItems).toEqual([0, 1, 2]);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(2);

    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([0, 1, 2, 3]);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(3);

    el.scrollTop += 10;
    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([1, 2, 3, 4]);
    expect(virtual().viewerTop).toEqual(10);
    expect(virtual().firstIndex).toEqual(1);
    expect(virtual().lastIndex).toEqual(4);

    el.scrollTop -= 10;
    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([0, 1, 2, 3]);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(3);

    el.scrollTop -= 10;
    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([0, 1, 2]);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(2);

    el.scrollTop += 7_000;
    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([699, 700, 701, 702]);
    expect(virtual().viewerTop).toEqual(6990);
    expect(virtual().firstIndex).toEqual(699);
    expect(virtual().lastIndex).toEqual(702);
  });

  test("onScroll handles reaching the bottom of the list", () => {
    const el = document.createElement("div");

    const [virtual, onScroll] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().visibleItems).toEqual([0, 1, 2]);
    expect(virtual().viewerTop).toEqual(0);

    el.scrollTop += 9_980;
    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([997, 998, 999]);
    expect(virtual().viewerTop).toEqual(9_970);
  });

  test("visibleList takes `overscanCount` into account", () => {
    const el = document.createElement("div");

    const [virtual, onScroll] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
      overscanCount: 2,
    });

    el.scrollTop += 100;
    onScroll(TARGETED_SCROLL_EVENT(el));

    expect(virtual().visibleItems).toEqual([8, 9, 10, 11, 12, 13]);
    expect(virtual().firstIndex).toEqual(8);
    expect(virtual().lastIndex).toEqual(13);
  });

  test("overscanCount defaults to 1 if undefined or zero", () => {
    const [virtualUndefined] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtualUndefined().visibleItems).toEqual([0, 1, 2]);

    const [virtualZero] = createVirtualList({
      items: TEST_LIST,
      rootHeight: 20,
      rowHeight: 10,
      overscanCount: 0,
    });

    expect(virtualZero().visibleItems).toEqual([0, 1, 2]);
  });

  test("lastIndex is undefined in an empty list", () => {
    const [virtual] = createVirtualList({
      items: [],
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().lastIndex).toEqual(undefined);
  });

  test("lastIndex is 0 in a singleton list", () => {
    const [virtual] = createVirtualList({
      items: [10],
      rootHeight: 20,
      rowHeight: 10,
    });

    expect(virtual().lastIndex).toEqual(0);
  });

  test("handles singleton list", () => {
    const [virtual] = createVirtualList({
      items: [10],
      rootHeight: 20,
      rowHeight: 10,
      overscanCount: 0,
    });

    expect(virtual().containerHeight).toEqual(10);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().visibleItems).toEqual([10]);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(0);
  });

  test("handles empty list", () => {
    const [virtual] = createVirtualList({
      items: [],
      rootHeight: 20,
      rowHeight: 10,
      overscanCount: 0,
    });

    expect(virtual().containerHeight).toEqual(0);
    expect(virtual().viewerTop).toEqual(0);
    expect(virtual().visibleItems).toEqual([]);
    expect(virtual().firstIndex).toEqual(0);
    expect(virtual().lastIndex).toEqual(undefined);
  });
});

describe("VirtualList", () => {
  test("renders a subset of the items", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      ROOT,
    );

    expect(ROOT.querySelector("#item-0")).not.toBeNull();
    expect(ROOT.querySelector("#item-1")).not.toBeNull();
    expect(ROOT.querySelector("#item-2")).not.toBeNull();
    expect(ROOT.querySelector("#item-3")).toBeNull();

    dispose();
  });

  test("renders the correct subset of the items based on scrolling", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      ROOT,
    );

    const scrollContainer = getScrollContainer();

    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-0")).not.toBeNull();
    expect(ROOT.querySelector("#item-1")).not.toBeNull();
    expect(ROOT.querySelector("#item-2")).not.toBeNull();
    expect(ROOT.querySelector("#item-3")).toBeNull();

    scrollContainer.scrollTop += 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-0")).not.toBeNull();
    expect(ROOT.querySelector("#item-1")).not.toBeNull();
    expect(ROOT.querySelector("#item-2")).not.toBeNull();
    expect(ROOT.querySelector("#item-3")).not.toBeNull();
    expect(ROOT.querySelector("#item-4")).toBeNull();

    scrollContainer.scrollTop += 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-0")).toBeNull();
    expect(ROOT.querySelector("#item-1")).not.toBeNull();
    expect(ROOT.querySelector("#item-2")).not.toBeNull();
    expect(ROOT.querySelector("#item-3")).not.toBeNull();
    expect(ROOT.querySelector("#item-4")).not.toBeNull();
    expect(ROOT.querySelector("#item-5")).toBeNull();

    scrollContainer.scrollTop -= 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-0")).not.toBeNull();
    expect(ROOT.querySelector("#item-1")).not.toBeNull();
    expect(ROOT.querySelector("#item-2")).not.toBeNull();
    expect(ROOT.querySelector("#item-3")).not.toBeNull();
    expect(ROOT.querySelector("#item-4")).toBeNull();

    scrollContainer.scrollTop -= 10;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-0")).not.toBeNull();
    expect(ROOT.querySelector("#item-1")).not.toBeNull();
    expect(ROOT.querySelector("#item-2")).not.toBeNull();
    expect(ROOT.querySelector("#item-3")).toBeNull();

    dispose();
  });

  test("renders the correct subset of the items for the end of the list", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      ROOT,
    );

    const scrollContainer = getScrollContainer();

    scrollContainer.scrollTop += 9_980;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-996")).toBeNull();
    expect(ROOT.querySelector("#item-997")).not.toBeNull();
    expect(ROOT.querySelector("#item-998")).not.toBeNull();
    expect(ROOT.querySelector("#item-999")).not.toBeNull();
    expect(ROOT.querySelector("#item-1000")).toBeNull();

    dispose();
  });

  test("renders `overscanCount` rows above and below the visible rendered items", () => {
    const dispose = render(
      () => (
        <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} overscanCount={2}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      ROOT,
    );

    const scrollContainer = getScrollContainer();

    scrollContainer.scrollTop += 100;
    scrollContainer.dispatchEvent(SCROLL_EVENT);

    expect(ROOT.querySelector("#item-7")).toBeNull();
    expect(ROOT.querySelector("#item-8")).not.toBeNull();
    expect(ROOT.querySelector("#item-9")).not.toBeNull();
    expect(ROOT.querySelector("#item-10")).not.toBeNull();
    expect(ROOT.querySelector("#item-11")).not.toBeNull();
    expect(ROOT.querySelector("#item-12")).not.toBeNull();
    expect(ROOT.querySelector("#item-13")).not.toBeNull();
    expect(ROOT.querySelector("#item-14")).toBeNull();

    dispose();
  });

  test("renders when list is empty", () => {
    const dispose = render(
      () => (
        <VirtualList each={[]} rootHeight={20} rowHeight={10}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      ROOT,
    );

    expect(getScrollContainer()).not.toBeNull();

    dispose();
  });

  test("renders when list is empty with optional fallback", () => {
    const dispose = render(
      () => (
        <VirtualList each={[]} fallback={<div id="fallback" />} rootHeight={20} rowHeight={10}>
          {item => <div id={"item-" + item} style={{ height: "10px" }} />}
        </VirtualList>
      ),
      ROOT,
    );

    expect(getScrollContainer()).not.toBeNull();

    expect(ROOT.querySelector("#fallback")).not.toBeNull();

    dispose();
  });
});
