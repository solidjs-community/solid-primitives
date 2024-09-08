import { describe, test, expect, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { VirtualList } from "../src/index.jsx";

import { TEST_LIST, VirtualListItem } from "./helpers.jsx";

describe("VirtualList", () => {
  const SELECTOR_CLASS_NAME = "scroll-container-selector";

  const createScrollList = (container: HTMLElement) => (distance: number) => {
    const scrollContainer = container.querySelector(`.${SELECTOR_CLASS_NAME}`);
    expect(scrollContainer).not.toBeNull();

    fireEvent.scroll(scrollContainer!, {
      target: { scrollTop: scrollContainer!.scrollTop + distance },
    });
  };

  beforeEach(() => {
    cleanup();
  });

  test("renders a subset of the items", () => {
    render(() => (
      <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10}>
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    ));

    expect(screen.getByText(0)).not.toBeNull();
    expect(screen.getByText(1)).not.toBeNull();
    expect(screen.getByText(2)).not.toBeNull();
    expect(screen.queryByText(3)).toBeNull();
  });

  test("scrolling renders the correct subset of the items", () => {
    const { container } = render(() => (
      <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    ));

    const scrollList = createScrollList(container);

    scrollList(0);
    expect(screen.getByText(0)).not.toBeNull();
    expect(screen.getByText(1)).not.toBeNull();
    expect(screen.getByText(2)).not.toBeNull();
    expect(screen.queryByText(3)).toBeNull();

    scrollList(10);
    expect(screen.getByText(0)).not.toBeNull();
    expect(screen.getByText(1)).not.toBeNull();
    expect(screen.getByText(2)).not.toBeNull();
    expect(screen.getByText(3)).not.toBeNull();
    expect(screen.queryByText(4)).toBeNull();

    scrollList(10);
    expect(screen.queryByText(0)).toBeNull();
    expect(screen.getByText(1)).not.toBeNull();
    expect(screen.getByText(2)).not.toBeNull();
    expect(screen.getByText(3)).not.toBeNull();
    expect(screen.getByText(4)).not.toBeNull();
    expect(screen.queryByText(5)).toBeNull();

    scrollList(-10);
    expect(screen.getByText(0)).not.toBeNull();
    expect(screen.getByText(1)).not.toBeNull();
    expect(screen.getByText(2)).not.toBeNull();
    expect(screen.getByText(3)).not.toBeNull();
    expect(screen.queryByText(4)).toBeNull();

    scrollList(-10);
    expect(screen.getByText(0)).not.toBeNull();
    expect(screen.getByText(1)).not.toBeNull();
    expect(screen.getByText(2)).not.toBeNull();
    expect(screen.queryByText(3)).toBeNull();
  });

  test("renders the correct subset of the items for the end of the list", () => {
    const { container } = render(() => (
      <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    ));

    createScrollList(container)(9_980);

    expect(screen.queryByText(996)).toBeNull();
    expect(screen.getByText(997)).not.toBeNull();
    expect(screen.getByText(998)).not.toBeNull();
    expect(screen.getByText(999)).not.toBeNull();
  });

  test("renders `overScan` rows above and below the visible rendered items", () => {
    const { container } = render(() => (
      <VirtualList
        each={TEST_LIST}
        rootHeight={20}
        rowHeight={10}
        overscanCount={2}
        class={SELECTOR_CLASS_NAME}
      >
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    ));

    createScrollList(container)(100);

    expect(screen.queryByText(7)).toBeNull();
    expect(screen.getByText(8)).not.toBeNull();
    expect(screen.getByText(9)).not.toBeNull();
    expect(screen.getByText(10)).not.toBeNull();
    expect(screen.getByText(11)).not.toBeNull();
    expect(screen.getByText(12)).not.toBeNull();
    expect(screen.getByText(13)).not.toBeNull();
    expect(screen.queryByText(14)).toBeNull();
  });

  test("overscanCount defaults to 1 if undefined", () => {
    const { container } = render(() => (
      <VirtualList each={TEST_LIST} rootHeight={20} rowHeight={10} class={SELECTOR_CLASS_NAME}>
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    ));

    createScrollList(container)(100);

    expect(screen.queryByText(8)).toBeNull();
    expect(screen.getByText(9)).not.toBeNull();
    expect(screen.getByText(10)).not.toBeNull();
    expect(screen.getByText(11)).not.toBeNull();
    expect(screen.getByText(12)).not.toBeNull();
    expect(screen.queryByText(13)).toBeNull();
  });

  test("overscanCount defaults to 1 if set to zero", () => {
    const { container } = render(() => (
      <VirtualList
        each={TEST_LIST}
        rootHeight={20}
        rowHeight={10}
        overscanCount={0}
        class={SELECTOR_CLASS_NAME}
      >
        {item => <VirtualListItem item={item} />}
      </VirtualList>
    ));

    createScrollList(container)(100);

    expect(screen.queryByText(8)).toBeNull();
    expect(screen.getByText(9)).not.toBeNull();
    expect(screen.getByText(10)).not.toBeNull();
    expect(screen.getByText(11)).not.toBeNull();
    expect(screen.getByText(12)).not.toBeNull();
    expect(screen.queryByText(13)).toBeNull();
  });
});
