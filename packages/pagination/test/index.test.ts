import { describe, test, expect } from "vitest";
import { createRoot } from "solid-js";
import { createInfiniteScroll, createPagination } from "../src";

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
        ">|"
      ]);
      expect(paginationProps().findIndex(({ ["aria-current"]: current }) => current)).toBe(2);
      setPage(page() + 1);
      expect(paginationProps().findIndex(({ ["aria-current"]: current }) => current)).toBe(3);
      dispose();
    }));
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
