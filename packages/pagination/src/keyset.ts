import { createSignal, type Accessor } from "solid-js";

export interface KeysetCursor {
  readonly id: string;
  readonly sortValue: string | number;
}

export interface KeysetPaginationOptions<T> {
  pageSize?: number;
  fetcher: (params: {
    cursor: KeysetCursor | null;
    direction: "forward" | "backward";
    limit: number;
  }) => Promise<readonly T[]>;
  getCursor: (item: T) => KeysetCursor;
}

export interface KeysetPaginationReturn<T> {
  items: Accessor<readonly T[]>;
  isLoading: Accessor<boolean>;
  hasNext: Accessor<boolean>;
  hasPrev: Accessor<boolean>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  reset: () => Promise<void>;
}

export function createKeysetPagination<T>(
  options: KeysetPaginationOptions<T>,
): KeysetPaginationReturn<T> {
  const pageSize = options.pageSize ?? 20;
  const [items, setItems] = createSignal<readonly T[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [hasNext, setHasNext] = createSignal(false);
  const [hasPrev, setHasPrev] = createSignal(false);

  const cursorStack: (KeysetCursor | null)[] = [null];
  let currentIndex = 0;

  const fetchPage = async (
    cursor: KeysetCursor | null,
    direction: "forward" | "backward",
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await options.fetcher({
        cursor,
        direction,
        limit: pageSize + 1,
      });

      const hasMore = result.length > pageSize;
      const pageItems = hasMore ? result.slice(0, pageSize) : result;

      setItems(pageItems);
      setHasNext(hasMore);
      setHasPrev(currentIndex > 0);

      if (direction === "forward" && pageItems.length > 0) {
        const lastItem = pageItems[pageItems.length - 1]!;
        const nextCursor = options.getCursor(lastItem);
        if (currentIndex === cursorStack.length - 1) {
          cursorStack.push(nextCursor);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const nextPage = async (): Promise<void> => {
    if (!hasNext() || isLoading()) return;
    currentIndex += 1;
    const cursor = cursorStack[currentIndex] ?? null;
    await fetchPage(cursor, "forward");
  };

  const prevPage = async (): Promise<void> => {
    if (!hasPrev() || isLoading()) return;
    currentIndex = Math.max(0, currentIndex - 1);
    const cursor = cursorStack[currentIndex] ?? null;
    await fetchPage(cursor, "backward");
  };

  const reset = async (): Promise<void> => {
    cursorStack.length = 1;
    cursorStack[0] = null;
    currentIndex = 0;
    await fetchPage(null, "forward");
  };

  return {
    items,
    isLoading,
    hasNext,
    hasPrev,
    nextPage,
    prevPage,
    reset,
  };
}
