import {
  access,
  tryOnCleanup,
  noop,
  wrapSetter,
  type MaybeAccessor,
} from "@solid-primitives/utils";
import {
  type Accessor,
  type Setter,
  createEffect,
  createMemo,
  createRoot,
  createSignal,
  onCleanup,
} from "solid-js";
import { isServer, type JSX } from "@solidjs/web";

/**
 * createSegment - create a reactive segment out of an array of items
 * @param {MaybeAccessor<any[]>} items - array of items
 * @param {MaybeAccessor<number>} limit - limit of items per segment
 * @param {Accessor<number>} page - segment number starting with 1
 *
 * ```ts
 * const [limit, setLimit] = createSignal(10);
 * const [paginationProps, page, setPage] = createPagination(() => ({
 *   pages: Math.ceil(items().length / limit())
 * }));
 * const segment = createSegment(items, limit, page);
 * ```
 */
export const createSegment = <T>(
  items: MaybeAccessor<T[]>,
  limit: MaybeAccessor<number>,
  page: Accessor<number>,
): Accessor<T[]> => {
  let previousStart = NaN,
    previousEnd = NaN;
  return createMemo(prev => {
    const currentItems = access(items);
    const start = (page() - 1) * access(limit);
    const end = Math.min(start + access(limit), currentItems.length);
    if (
      prev &&
      ((prev.length === 0 && end <= start) || (start === previousStart && end === previousEnd))
    ) {
      return prev;
    }
    previousStart = start;
    previousEnd = end;
    return currentItems.slice(start, end);
  });
};

export type PaginationOptions = {
  /** the overall number of pages */
  pages: number;
  /** the highest number of pages to show at the same time */
  maxPages?: number;
  /** start with another page than `1` */
  initialPage?: number;
  /** show an element for the first page */
  showFirst?: boolean | ((page: number, pages: number) => boolean);
  /** show an element for the previous page */
  showPrev?: boolean | ((page: number, pages: number) => boolean);
  /** show an element for the next page */
  showNext?: boolean | ((page: number, pages: number) => boolean);
  /** show an element for the last page */
  showLast?: boolean | ((page: number, pages: number) => boolean);
  /** content for the first page element, e.g. an SVG icon, default is "|<" */
  firstContent?: JSX.Element;
  /** content for the previous page element, e.g. an SVG icon, default is "<" */
  prevContent?: JSX.Element;
  /** content for the next page element, e.g. an SVG icon, default is ">" */
  nextContent?: JSX.Element;
  /** content for the last page element, e.g. an SVG icon, default is ">|" */
  lastContent?: JSX.Element;
  /** accessible name for the first page element, default is "First page" */
  firstAriaLabel?: string;
  /** accessible name for the previous page element, default is "Previous page" */
  prevAriaLabel?: string;
  /** accessible name for the next page element, default is "Next page" */
  nextAriaLabel?: string;
  /** accessible name for the last page element, default is "Last page" */
  lastAriaLabel?: string;
  /** number of pages a large jump, if it should exist, should skip */
  jumpPages?: number;
};

export type PaginationProps = {
  "aria-current"?: boolean;
  "aria-label"?: string;
  disabled?: boolean;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onKeyUp?: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent>;
  children: JSX.Element;
  /** page number this refers to, not enumerable, allows to use props.page to get the page number */
  readonly page?: number;
}[];

export const PAGINATION_DEFAULTS = {
  pages: 1,
  maxPages: 10,
  showDisabled: true,
  showFirst: true,
  showPrev: true,
  showNext: true,
  showLast: true,
  firstContent: "|<",
  prevContent: "<",
  nextContent: ">",
  lastContent: ">|",
  firstAriaLabel: "First page",
  prevAriaLabel: "Previous page",
  nextAriaLabel: "Next page",
  lastAriaLabel: "Last page",
} as const;

const normalizeOption = (
  key: "showFirst" | "showPrev" | "showNext" | "showLast",
  value: PaginationOptions["showFirst" | "showPrev" | "showNext" | "showLast"],
  page: number,
  pages: number,
) =>
  typeof value === "boolean"
    ? value
    : typeof value === "function"
      ? value(page, pages)
      : PAGINATION_DEFAULTS[key];

/**
 * Creates a reactive pagination to fill your layout with.
 * @param options Options to configure the pagination. Can be a reactive signal. See {@link PaginationOptions}
 * @returns A tuple of props, page and setPage. Props is an array of props to spread on each button. (See {@link PaginationProps}) Page is the current page number. setPage is a function to set the page number.
 * ```ts
 * [props: Accessor<PaginationProps>, page: Accessor<number>, setPage: Setter<number>]
 * ```
 * @example
 * ```tsx
 * const [paginationProps, page, setPage] = createPagination({ pages: 100 });
 *
 * createEffect(() => {
 *   console.log(page());
 * })
 *
 * <nav class="pagination">
 *   <For each={paginationProps()}>{props => <button {...props} />}</For>
 * </nav>
 * ```
 */
export const createPagination = (
  options?: MaybeAccessor<PaginationOptions>,
): [props: Accessor<PaginationProps>, page: Accessor<number>, setPage: Setter<number>] => {
  const opts = createMemo(() => Object.assign({}, PAGINATION_DEFAULTS, access(options)));
  // ownedWrite allows setPage to be called from event handlers and reactive scopes
  const [rawPage, setPage] = wrapSetter(
    createSignal<number>(opts().initialPage || 1, { ownedWrite: true }),
    setter =>
      (p: number | ((prev: number) => number)): number => {
        const n = typeof p === "function" ? p(page()) : p;
        if (n < 1) return setter(1);
        const pages = opts().pages;
        if (n > pages) return setter(pages);
        return setter(n);
      },
  );

  // Clamp page to valid range reactively — handles page count decreasing below current page
  const page: Accessor<number> = createMemo(() => Math.max(1, Math.min(rawPage(), opts().pages)));

  const goPage = (p: number | ((p: number) => number), ev: KeyboardEvent) => {
    setPage(p);
    if ("currentTarget" in ev)
      (ev.currentTarget as HTMLElement).parentNode
        ?.querySelector<HTMLElement>('[aria-current="true"]')
        ?.focus();
  };

  const onKeyUp = (pageNo: number, ev: KeyboardEvent) =>
    (
      ({
        ArrowLeft: () => goPage(p => p - 1, ev),
        ArrowRight: () => goPage(p => p + 1, ev),
        Home: () => goPage(1, ev),
        End: () => goPage(opts().pages, ev),
        Space: () => goPage(pageNo, ev),
        Return: () => goPage(pageNo, ev),
      })[ev.key] || noop
    )();

  const maxPages = createMemo(() => Math.min(opts().maxPages, opts().pages));

  const pages = createMemo<PaginationProps>(prev =>
    [...Array(opts().pages)].map(
      (_, i) =>
        (prev ?? [])[i] ||
        ((pageNo: number) =>
          Object.defineProperties(
            isServer
              ? { children: pageNo.toString() }
              : {
                  children: pageNo.toString(),
                  onClick: [setPage, pageNo] as const,
                  onKeyUp: [onKeyUp, pageNo] as const,
                },
            {
              "aria-current": {
                get: () => (page() === pageNo ? "true" : undefined),
                set: noop,
                enumerable: true,
              },
              page: { value: pageNo, enumerable: false },
            },
          ))(i + 1),
    ),
  );
  const first = Object.defineProperties(
    isServer
      ? ({} as PaginationProps[number])
      : ({
          onClick: [setPage, 1] as const,
          onKeyUp: [onKeyUp, 1] as const,
        } as unknown as PaginationProps[number]),
    {
      disabled: { get: () => page() <= 1, set: noop, enumerable: true },
      children: { get: () => opts().firstContent, set: noop, enumerable: true },
      "aria-label": { get: () => opts().firstAriaLabel, set: noop, enumerable: true },
      page: { value: 1, enumerable: false },
    },
  );
  const back = Object.defineProperties(
    isServer
      ? ({} as PaginationProps[number])
      : ({
          onClick: () => setPage(p => (p > 1 ? p - 1 : p)),
          onKeyUp: (ev: KeyboardEvent) => onKeyUp(page() - 1, ev),
        } as unknown as PaginationProps[number]),
    {
      disabled: { get: () => page() <= 1, set: noop, enumerable: true },
      children: { get: () => opts().prevContent, set: noop, enumerable: true },
      "aria-label": { get: () => opts().prevAriaLabel, set: noop, enumerable: true },
      page: { get: () => Math.max(1, page() - 1), enumerable: false },
    },
  );
  const next = Object.defineProperties(
    isServer
      ? ({} as PaginationProps[number])
      : ({
          onClick: () => setPage(p => (p < opts().pages ? p + 1 : p)),
          onKeyUp: (ev: KeyboardEvent) => onKeyUp(page() - 1, ev),
        } as unknown as PaginationProps[number]),
    {
      disabled: { get: () => page() >= opts().pages, set: noop, enumerable: true },
      children: { get: () => opts().nextContent, set: noop, enumerable: true },
      "aria-label": { get: () => opts().nextAriaLabel, set: noop, enumerable: true },
      page: { get: () => Math.min(opts().pages, page() + 1), enumerable: false },
    },
  );
  const last = Object.defineProperties(
    isServer
      ? ({} as PaginationProps[number])
      : ({
          onClick: () => setPage(opts().pages),
          onKeyUp: (ev: KeyboardEvent) => onKeyUp(opts().pages, ev),
        } as unknown as PaginationProps[number]),
    {
      disabled: { get: () => page() >= opts().pages, set: noop, enumerable: true },
      children: { get: () => opts().lastContent, set: noop, enumerable: true },
      "aria-label": { get: () => opts().lastAriaLabel, set: noop, enumerable: true },
      page: { get: () => opts().pages, enumerable: false },
    },
  );
  const jumpBack = Object.defineProperties(
    isServer
      ? ({} as PaginationProps[number])
      : ({
          onClick: () => setPage(Math.max(1, page() - (opts().jumpPages || Infinity))),
          onKeyUp: (ev: KeyboardEvent) => onKeyUp(page() - (opts().jumpPages || Infinity), ev),
        } as unknown as PaginationProps[number]),
    {
      disabled: {
        get: () => page() - (opts().jumpPages || Infinity) < 0,
        set: noop,
        enumerable: true,
      },
      children: { get: () => `-${opts().jumpPages}`, set: noop, enumerable: true },
      page: { get: () => Math.max(1, page() - (opts().jumpPages || Infinity)), enumerable: false },
    },
  );
  const jumpForth = Object.defineProperties(
    isServer
      ? ({} as PaginationProps[number])
      : ({
          onClick: () => setPage(Math.min(opts().pages, page() + (opts().jumpPages || Infinity))),
          onKeyUp: (ev: KeyboardEvent) =>
            onKeyUp(Math.min(opts().pages, page() + (opts().jumpPages || Infinity)), ev),
        } as unknown as PaginationProps[number]),
    {
      disabled: {
        get: () => page() + (opts().jumpPages || Infinity) > opts().pages,
        set: noop,
        enumerable: true,
      },
      children: { get: () => `+${opts().jumpPages}`, set: noop, enumerable: true },
      page: {
        get: () => Math.min(opts().pages, page() + (opts().jumpPages || Infinity)),
        enumerable: false,
      },
    },
  );

  const start = createMemo(() =>
    Math.min(opts().pages - maxPages(), Math.max(1, page() - (maxPages() >> 1)) - 1),
  );
  const showFirst = createMemo(() =>
    normalizeOption("showFirst", opts().showFirst, page(), opts().pages),
  );
  const showPrev = createMemo(() =>
    normalizeOption("showPrev", opts().showPrev, page(), opts().pages),
  );
  const showNext = createMemo(() =>
    normalizeOption("showNext", opts().showNext, page(), opts().pages),
  );
  const showLast = createMemo(() =>
    normalizeOption("showLast", opts().showLast, page(), opts().pages),
  );

  const paginationProps = createMemo<PaginationProps>(() => {
    const props = [];
    if (showFirst()) {
      props.push(first);
    }
    if (opts().jumpPages) {
      props.push(jumpBack);
    }
    if (showPrev()) {
      props.push(back);
    }
    props.push(...pages().slice(start(), start() + maxPages()));
    if (showNext()) {
      props.push(next);
    }
    if (opts().jumpPages) {
      props.push(jumpForth);
    }
    if (showLast()) {
      props.push(last);
    }
    return props;
  });

  return [paginationProps, page, setPage];
};

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      infiniteScrollLoader: boolean;
    }
  }
}

export type _E = JSX.Element;

/** A single page's async fetch, gated independently of every other page. */
export type InfiniteScrollPage<T> = {
  /** the fetched items for this page — read inside `<Loading>`/`<Errored>` to gate a subtree on it */
  content: Accessor<T[]>;
  /** true while this page's fetch is in flight */
  fetching: Accessor<boolean>;
  /** the error from this page's last failed fetch, or undefined */
  error: Accessor<unknown>;
  /** re-runs this page's fetcher, clearing its error */
  retry: () => void;
};

/**
 * Provides an easy way to implement infinite scrolling. Each page is its own
 * independent async unit — render it with `<Loading>`/`<Errored>` for
 * idiomatic suspense/retry, or read `fetching`/`error` directly for a
 * boundary-free UI.
 *
 * ```tsx
 * const [pages, loader, { getPage, end }] = createInfiniteScroll(fetcher);
 *
 * <For each={pages()}>
 *   {i => {
 *     const page = getPage(i);
 *     return (
 *       <Errored fallback={(err, reset) => <button onClick={reset}>Retry: {String(err())}</button>}>
 *         <Loading fallback={<Skeleton />}>
 *           <For each={page.content()}>{item => <Row item={item} />}</For>
 *         </Loading>
 *       </Errored>
 *     );
 *   }}
 * </For>
 * <Show when={!end()}><div ref={loader} /></Show>
 * ```
 * @param fetcher `(page: number) => Promise<T[]>`
 * @return `pages()` is an accessor for the page indices requested so far — feed directly to `<For>`
 * @return `loader` is a ref function to attach to the sentinel element that triggers loading more
 * @method `getPage` returns (and caches) the `{ content, fetching, error, retry }` bundle for a page index
 * @method `pageCount` is an accessor for the number of pages requested
 * @method `setPageCount` allows manually growing or jumping the requested page count
 * @method `end` is true once a page fetch returns zero items
 * @method `reset` disposes every cached page and starts over from the first page
 */
export function createInfiniteScroll<T>(fetcher: (page: number) => Promise<T[]>): [
  pages: Accessor<number[]>,
  loader: (el: Element) => void,
  options: {
    pageCount: Accessor<number>;
    setPageCount: Setter<number>;
    end: Accessor<boolean>;
    getPage: (index: number) => InfiniteScrollPage<T>;
    reset: () => void;
  },
] {
  const initialPageCount = isServer ? 0 : 1;
  // ownedWrite allows setters to be called from reactive scopes and event handlers
  const [pageCount, setPageCount] = createSignal(initialPageCount, { ownedWrite: true });
  const pages = createMemo(() => Array.from({ length: pageCount() }, (_, i) => i));
  const [end, setEnd] = createSignal(false, { ownedWrite: true });

  const pageCache = new Map<number, InfiniteScrollPage<T>>();
  const pageDisposers = new Map<number, () => void>();

  // Set by the IO block below (browser only); re-observes the sentinel after
  // a page resolves so IO fires again if it's still in the viewport — this
  // auto-fills the viewport before handing off to the user's scroll.
  let reobserve = noop;

  function getPage(index: number): InfiniteScrollPage<T> {
    const cached = pageCache.get(index);
    if (cached) return cached;

    let entry!: InfiniteScrollPage<T>;
    const dispose = createRoot(disposePage => {
      const [fetching, setFetching] = createSignal(true, { ownedWrite: true });
      const [error, setError] = createSignal<unknown>(undefined, { ownedWrite: true });
      // Bumped on retry so `content` (below) re-reads the latest `request`.
      const [attempt, setAttempt] = createSignal(0, { ownedWrite: true });

      // The primitive owns the promise directly (rather than calling
      // `fetcher` from inside an async `createMemo`) because the framework's
      // `NotReadyError`/boundary plumbing for *rejections* relies on
      // internal queueing that isn't part of the public API — a plain
      // `.then`/`.catch` here is the reliable way to get `fetching`/`error`.
      // `content` still hands back the same promise, so `<Loading>`/
      // `<Errored>` work normally for JSX consumers that want them.
      let request!: Promise<T[]>;
      const startRequest = () => {
        setFetching(true);
        setError(undefined);
        const thisRequest = fetcher(index);
        request = thisRequest;
        thisRequest
          .then(value => {
            if (thisRequest !== request) return; // superseded by a retry
            setFetching(false);
            if (value.length === 0) setEnd(true);
            else if (index === pageCount() - 1) reobserve();
          })
          .catch(err => {
            if (thisRequest !== request) return;
            setFetching(false);
            setError(err);
          });
      };

      // Runs before `content` below so its first, eager computation already
      // sees a populated `request` — otherwise it caches a plain `undefined`
      // (not yet a thenable) and never revisits it.
      startRequest();

      const content = createMemo(() => {
        attempt();
        return request;
      });

      entry = {
        content,
        fetching,
        error,
        retry: () => {
          startRequest();
          setAttempt(a => a + 1);
        },
      };
      return disposePage;
    });

    pageCache.set(index, entry);
    pageDisposers.set(index, dispose);
    return entry;
  }

  function reset() {
    for (const dispose of pageDisposers.values()) dispose();
    pageCache.clear();
    pageDisposers.clear();
    setEnd(false);
    setPageCount(initialPageCount);
  }

  let add: (el: Element) => void = noop;
  if (!isServer) {
    let sentinelEl: Element | null = null;
    const io = new IntersectionObserver(e => {
      if (e.length === 0 || !e[0]!.isIntersecting || end()) return;
      // Don't outrun the last requested page: wait for it to settle, and
      // don't auto-advance past a failed one — call `retry` on it instead.
      const last = getPage(pageCount() - 1);
      if (last.fetching() || last.error()) return;
      setPageCount(p => p + 1);
    });
    onCleanup(() => io.disconnect());
    add = (el: Element) => {
      sentinelEl = el;
      io.observe(el);
      tryOnCleanup(() => {
        io.unobserve(el);
        if (sentinelEl === el) sentinelEl = null;
      });
    };
    reobserve = () => {
      const el = sentinelEl;
      if (el) {
        io.unobserve(el);
        io.observe(el);
      }
    };

    // Starts each page's fetch the moment it's requested, regardless of
    // whether the consumer's JSX has rendered that page index yet.
    createEffect(
      () => pageCount(),
      count => {
        if (count > 0) getPage(count - 1);
      },
    );
  }

  return [pages, add, { pageCount, setPageCount, end, getPage, reset }];
}
