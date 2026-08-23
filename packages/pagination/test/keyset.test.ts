import { describe, it, expect, vi } from "vitest";
import { createRoot } from "solid-js";
import { createKeysetPagination } from "../src/keyset";

describe("createKeysetPagination", () => {
  it("initializes with empty items and inactive loading", () => {
    createRoot(dispose => {
      const pagination = createKeysetPagination({
        fetcher: async () => [],
        getCursor: (item: { id: string }) => ({ id: item.id, sortValue: item.id }),
      });
      expect(pagination.items()).toEqual([]);
      expect(pagination.isLoading()).toBe(false);
      expect(pagination.hasNext()).toBe(false);
      expect(pagination.hasPrev()).toBe(false);
      dispose();
    });
  });
});
