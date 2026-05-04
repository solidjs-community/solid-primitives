import { describe, test, expect } from "vitest";
import { createMemo, createRoot, createSignal, flush } from "solid-js";
import {
  createInfiniteScroll,
  createPagination,
  createSegment,
  PaginationOptions,
} from "../src/index.js";

describe("createPagination", () => {
  test("createPagination returns page getter and setter", () => {
    const { page, setPage, dispose } = createRoot(dispose => {
      const [, page, setPage] = createPagination({ pages: 100 });
      return { page, setPage, dispose };
    });
    expect(page(), "initial value should be 1").toBe(1);
    setPage(2);
    flush();
    expect(page(), "value after change should be 2").toBe(2);
    dispose();
  });

  test("createPagination returns props", () => {
    const { paginationProps, page, setPage, dispose } = createRoot(dispose => {
      const [paginationProps, page, setPage] = createPagination({ pages: 100 });
      return { paginationProps, page, setPage, dispose };
    });
    expect(paginationProps().map(({ children }) => children)).toEqual([
      "|<",
      "<",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      ">",
      ">|",
    ]);
    expect(paginationProps().findIndex(({ ["aria-current"]: current }) => current)).toBe(2);
    setPage(page() + 1);
    flush();
    expect(paginationProps().findIndex(({ ["aria-current"]: current }) => current)).toBe(3);
    dispose();
  });

  test("createPagination clamps start", () =>
    createRoot(dispose => {
      const [paginationProps, _page, _setPage] = createPagination({
        pages: 10,
        maxPages: 13,
      });
      const extraProps = 4;
      expect(paginationProps().length, "pages").toBe(10 + extraProps);
      dispose();
    }));

  test("createPagination reacts to options update", () => {
    const commonOptions = {
      showFirst: false,
      showPrev: false,
      showNext: false,
      showLast: false,
    };
    const [options, setOptions] = createSignal({ ...commonOptions, pages: 10, maxPages: 20 });
    const { paginationProps, dispose } = createRoot(dispose => {
      const [paginationProps] = createPagination(options);
      return { paginationProps, dispose };
    });
    expect(paginationProps().length, "initial pages").toBe(10);
    setOptions({ ...commonOptions, pages: 5, maxPages: 10 });
    flush();
    expect(paginationProps().length, "pages after change").toBe(5);
    dispose();
  });

  test("createPagination pages reused", () => {
    const commonOptions = {
      showFirst: false,
      showPrev: false,
      showNext: false,
      showLast: false,
    };
    const [options, setOptions] = createSignal({ ...commonOptions, pages: 3 });
    const { paginationProps, dispose } = createRoot(dispose => {
      const [paginationProps] = createPagination(options);
      return { paginationProps, dispose };
    });
    const initialPages = paginationProps();
    setOptions({ ...commonOptions, pages: 2 });
    flush();
    const updatedPages = paginationProps();
    expect(updatedPages.every((page, index) => Object.is(page, initialPages[index]))).toBe(true);
    dispose();
  });

  test("createPagination next back", () =>
    createRoot(dispose => {
      const [paginationProps, page, setPage] = createPagination({
        pages: 100,
        maxPages: 1,
        showFirst: false,
        initialPage: 3,
      });
      var back = paginationProps()[0];
      var next = paginationProps()[2];

      expect(back?.page, "back page should be 2").toStrictEqual(2);
      expect(next?.page, "next page should be 4").toStrictEqual(4);

      dispose();
    }));

  test("setting page below one will yield the first page", () => {
    const { page, setPage, dispose } = createRoot(dispose => {
      const [, page, setPage] = createPagination({ pages: 10, maxPages: 5 });
      return { page, setPage, dispose };
    });
    expect(page()).toBe(1);
    setPage(0);
    flush();
    expect(page()).toBe(1);
    setPage(-1);
    flush();
    expect(page()).toBe(1);
    dispose();
  });

  test("setting page beyond the number pages will yield the last page", () => {
    const { page, setPage, dispose } = createRoot(dispose => {
      const [, page, setPage] = createPagination({ pages: 10, maxPages: 5, initialPage: 10 });
      return { page, setPage, dispose };
    });
    expect(page()).toBe(10);
    setPage(11);
    flush();
    expect(page()).toBe(10);
    setPage(Infinity);
    flush();
    expect(page()).toBe(10);
    dispose();
  });

  test("lowering the number of pages will not make the page go beyond it", () => {
    const [options, setOptions] = createSignal<PaginationOptions>({
      pages: 10,
      maxPages: 5,
      initialPage: 10,
    });
    const { page, dispose } = createRoot(dispose => {
      const [, page] = createPagination(options);
      return { page, dispose };
    });
    expect(page()).toBe(10);
    setOptions({ pages: 8, maxPages: 5 });
    flush();
    expect(page()).toBe(8);
    dispose();
  });
});

describe("createSegment", () => {
  test("creates valid segments", () => {
    const [page, setPage] = createSignal(1);
    const { segment, dispose } = createRoot(dispose => {
      const items = createMemo(() => Array.from({ length: 50 }, (_, i) => i + 1));
      return { segment: createSegment(items, 10, page), dispose };
    });

    expect(segment()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    setPage(5);
    flush();
    expect(segment()).toEqual([41, 42, 43, 44, 45, 46, 47, 48, 49, 50]);
    setPage(6);
    flush();
    expect(segment()).toEqual([]);
    dispose();
  });

  test("does not create the same segment twice", () => {
    const [length, setLength] = createSignal(50);
    const [page, setPage] = createSignal(1);
    const { segment, dispose } = createRoot(dispose => {
      const items = createMemo(() => Array.from({ length: length() }, (_, i) => i + 1));
      return { segment: createSegment(items, 10, page), dispose };
    });

    const seg1 = segment();
    setLength(10);
    flush();
    const seg2 = segment();
    expect(seg1).toBe(seg2);
    setPage(2);
    flush();
    const seg3 = segment();
    setPage(3);
    flush();
    const seg4 = segment();
    expect(seg3).toBe(seg4);
    dispose();
  });

  test("creates a new segment if new items are added", () => {
    const [length, setLength] = createSignal(55);
    const [page] = createSignal(6);
    const { segment, dispose } = createRoot(dispose => {
      const items = createMemo(() => Array.from({ length: length() }, (_, i) => i + 1));
      return { segment: createSegment(items, 10, page), dispose };
    });

    const seg1 = segment();
    expect(seg1).toEqual([51, 52, 53, 54, 55]);
    setLength(57);
    flush();
    const seg2 = segment();
    expect(seg2).toEqual([51, 52, 53, 54, 55, 56, 57]);
    expect(seg1).not.toBe(seg2);
    dispose();
  });
});

//@ts-ignore
global.IntersectionObserver = class {
  disconnect() {}
};

describe("createInfiniteScroll", () => {
  const fetcher = async (page: number) => Array.from({ length: page + 1 }, (_, i) => i);

  test("createInfiniteScroll", () => {
    const { pages, page, setPage, dispose } = createRoot(dispose => {
      const [pages, , { page, setPage }] = createInfiniteScroll(fetcher);
      return { pages, page, setPage, dispose };
    });
    expect(pages(), "initial value should be []").toStrictEqual([]);

    setPage(1);
    flush();
    expect(page(), "value should be 1").toStrictEqual(1);

    dispose();
  });
});
