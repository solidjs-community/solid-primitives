import { describe, test, expect } from "vitest";
import { createMemo, createRoot, createSignal } from "solid-js";
import { createInfiniteScroll, createPagination, createSegment, PaginationOptions } from "../src/index.js";
import { testEffect } from "../../resource/test/index.test.js";

describe("createPagination", () => {
  test("createPagination returns page getter and setter", () =>
    createRoot(dispose => {
      const [, page, setPage] = createPagination({ pages: 100 });
      expect(page(), "initial value should be 1").toBe(1);
      setPage(2);
      expect(page(), "value after change should be 2").toBe(2);
      dispose();
    }));

  test("createPagination returns props", () =>
    createRoot(dispose => {
      const [paginationProps, page, setPage] = createPagination({ pages: 100 });
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
      expect(paginationProps().findIndex(({ ["aria-current"]: current }) => current)).toBe(3);
      dispose();
    }));

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

  test("createPagination reacts to options update", () =>
    createRoot(dispose => {
      const commonOptions = {
        showFirst: false,
        showPrev: false,
        showNext: false,
        showLast: false,
      };
      const [options, setOptions] = createSignal({ ...commonOptions, pages: 10, maxPages: 20 });
      const [paginationProps, _page, _setPage] = createPagination(options);
      expect(paginationProps().length, "initial pages").toBe(10);
      setOptions({ ...commonOptions, pages: 5, maxPages: 10 });
      expect(paginationProps().length, "pages after change").toBe(5);
      dispose();
    }));

  test("createPagination pages reused", () =>
    createRoot(dispose => {
      const commonOptions = {
        showFirst: false,
        showPrev: false,
        showNext: false,
        showLast: false,
      };
      const [options, setOptions] = createSignal({ ...commonOptions, pages: 3 });
      const [paginationProps, _page, _setPage] = createPagination(options);
      const initialPages = paginationProps();
      setOptions({ ...commonOptions, pages: 2 });
      const updatedPages = paginationProps();
      expect(updatedPages.every((page, index) => Object.is(page, initialPages[index]))).toBe(true);
      dispose();
    }));

  test("createPagination next back", () => {
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
    });
  });

  test("setting page below one will yield the first page", () => {
    createRoot(dispose => {
      const [paginationProps, page, setPage] = createPagination({
        pages: 10,
        maxPages: 5
      });

      expect(page()).toBe(1);
      setPage(0);
      expect(page()).toBe(1);
      setPage(-1);
      expect(page()).toBe(1);

      dispose();
    })
  });

  test("setting page beyond the number pages will yield the last page", () => {
    createRoot(dispose => {
      const [paginationProps, page, setPage] = createPagination({
        pages: 10,
        maxPages: 5,
        initialPage: 10
      });

      expect(page()).toBe(10);
      setPage(11);
      expect(page()).toBe(10);
      setPage(Infinity);
      expect(page()).toBe(10);

      dispose();
    });
  });

  test("lowering the number of pages will not make the page go beyond it", () => {
    createRoot(dispose => {
      const [options, setOptions] = createSignal<PaginationOptions>({ pages: 10, maxPages: 5, initialPage: 10 });
      const [paginationProps, page, setPage] = createPagination(options);

      expect(page()).toBe(10);
      setOptions({ pages: 8, maxPages: 5 });
      expect(page()).toBe(8);

      dispose();
    });
  });
});

describe("createSegment", () => {
  test("creates valid segments", () => {
    createRoot(dispose => {
      const items = createMemo(() => Array.from({ length: 50 }, (_, i) => i + 1));
      const [page, setPage] = createSignal(1);
      const segment = createSegment(items, 10, page);

      expect(segment()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      setPage(5);
      expect(segment()).toEqual([41, 42, 43, 44, 45, 46, 47, 48, 49, 50]);
      setPage(6);
      expect(segment()).toEqual([]);

      dispose();
    });
  });

  test("does not create the same segment twice", () => {
    createRoot(dispose => {
      const [length, setLength] = createSignal(50);
      const items = createMemo(() => Array.from({ length: length() }, (_, i) => i + 1));
      const [page, setPage] = createSignal(1);
      const segment = createSegment(items, 10, page);

      const seg1 = segment();
      setLength(10);
      const seg2 = segment();
      expect(seg1).toBe(seg2);
      setPage(2);
      const seg3 = segment();
      setPage(3);
      const seg4 = segment();
      expect(seg3).toBe(seg4);

      dispose();
    });
  });

  test("creates a new segment if new items are added", () => {
    createRoot(dispose => {
      const [length, setLength] = createSignal(55);
      const items = createMemo(() => Array.from({ length: length() }, (_, i) => i + 1));
      const [page, setPage] = createSignal(6);
      const segment = createSegment(items, 10, page);
      
      const seg1 = segment();
      expect(seg1).toEqual([51, 52, 53, 54, 55]);
      setLength(57);
      const seg2 = segment();
      expect(seg2).toEqual([51, 52, 53, 54, 55, 56, 57]);
      expect(seg1).not.toBe(seg2);

      dispose();
    });
  })
});

//@ts-ignore
global.IntersectionObserver = class {
  disconnect() {}
};

describe("createInfiniteScroll", () => {
  const fetcher = async (page: number) => Array.from({ length: page + 1 }, (_, i) => i);

  test("createInfiniteScroll", () =>
    createRoot(dispose => {
      const [pages, , { page, setPage }] = createInfiniteScroll(fetcher);
      expect(pages(), "initial value should be []").toStrictEqual([]);

      setPage(1);
      expect(page(), "value should be 1").toStrictEqual(1);

      dispose();
    }));
});
