import { describe, test, expect } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createInfiniteScroll, createPagination } from "../src/index.js";

describe("createPagination", () => {
  test("createPagination returns initial page", () =>
    createRoot(dispose => {
      const [, page] = createPagination({ pages: 100 });
      expect(page(), "initial value should be 1").toBe(1);
      dispose();
    }));

  test("createPagination respects initialPage", () =>
    createRoot(dispose => {
      const [, page] = createPagination({ pages: 100, initialPage: 5 });
      expect(page(), "initial value should be 5").toBe(5);
      dispose();
    }));

  test("createPagination returns props on server", () =>
    createRoot(dispose => {
      const [paginationProps] = createPagination({ pages: 100 });
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
      dispose();
    }));

  test("createPagination applies default aria-labels on server", () =>
    createRoot(dispose => {
      const [paginationProps] = createPagination({ pages: 100 });
      const [first, prev, , , , , , , , , , , next, last] = paginationProps();
      expect(first?.["aria-label"]).toBe("First page");
      expect(prev?.["aria-label"]).toBe("Previous page");
      expect(next?.["aria-label"]).toBe("Next page");
      expect(last?.["aria-label"]).toBe("Last page");
      dispose();
    }));

  test("createPagination clamps start", () =>
    createRoot(dispose => {
      const [paginationProps] = createPagination({ pages: 10, maxPages: 13 });
      const extraProps = 4;
      expect(paginationProps().length, "pages").toBe(10 + extraProps);
      dispose();
    }));

  test("createPagination pages reused with reactive options", () => {
    const commonOptions = {
      showFirst: false,
      showPrev: false,
      showNext: false,
      showLast: false,
    };
    const [options] = createSignal({ ...commonOptions, pages: 3 });
    createRoot(dispose => {
      const [paginationProps] = createPagination(options);
      expect(paginationProps().length, "initial pages").toBe(3);
      dispose();
    });
  });
});

describe("createInfiniteScroll", () => {
  const fetcher = async (page: number) => Array.from({ length: page + 1 }, (_, i) => i);

  test("createInfiniteScroll returns empty state on server", () =>
    createRoot(dispose => {
      const [pages, , { pageCount, end }] = createInfiniteScroll(fetcher);
      expect(pages(), "initial pages should be empty").toEqual([]);
      expect(pageCount(), "initial pageCount should be 0").toBe(0);
      expect(end(), "initial end should be false").toBe(false);
      dispose();
    }));
});
