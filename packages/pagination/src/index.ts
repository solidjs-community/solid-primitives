import { access, tryOnCleanup, noop, type MaybeAccessor } from "@solid-primitives/utils";
import {
  type Accessor,
  type JSX,
  type Setter,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
} from "solid-js";
import { isServer } from "@solidjs/web";

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
  /** number of pages a large jump, if it should exist, should skip */
  jumpPages?: number;
};

export type PaginationProps = {
  "aria-current"?: boolean;
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
  const [rawPage, setRawPage] = createSignal(opts().initialPage || 1, { ownedWrite: true });

  const setPage = (p: number | ((_p: number) => number)) => {
    if (typeof p === "function") {
      p = p(page());
    }
    if (p < 1) {
      return setRawPage(1);
    }
    const pages = opts().pages;
    if (p > pages) {
      return setRawPage(pages);
    }
    return setRawPage(p);
  };

  // Clamp page to valid range reactively — handles page count decreasing below current page
  const page = createMemo(() => Math.max(1, Math.min(rawPage(), opts().pages)));

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

  return [paginationProps, page, setPage as Setter<number>];
};

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      infiniteScrollLoader: boolean;
    }
  }
}

export type _E = JSX.Element;

/**
 * Provides an easy way to implement infinite scrolling.
 *
 * ```ts
 * const [pages, loader, { page, setPage, setPages, end, setEnd }] = createInfiniteScroll(fetcher);
 * ```
 * @param fetcher `(page: number) => Promise<T[]>`
 * @return `pages()` is an accessor that contains the accumulated array of all fetched items
 * @return `loader` is a ref function to attach to the sentinel element that triggers loading
 * @method `page` is an accessor that contains the current page number
 * @method `setPage` allows to manually change the page number
 * @method `setPages` allows to manually replace the accumulated items
 * @method `end` is a boolean indicator for end of the content
 * @method `setEnd` allows to manually change the end state
 */
export function createInfiniteScroll<T>(fetcher: (page: number) => Promise<T[]>): [
  pages: Accessor<T[]>,
  loader: (el: Element) => void,
  options: {
    page: Accessor<number>;
    setPage: Setter<number>;
    setPages: Setter<T[]>;
    end: Accessor<boolean>;
    setEnd: Setter<boolean>;
  },
] {
  // ownedWrite allows setters to be called from reactive scopes and event handlers
  const [pages, setPages] = createSignal<T[]>([], { ownedWrite: true });
  const [page, setPage] = createSignal(0, { ownedWrite: true });
  const [end, setEnd] = createSignal(false, { ownedWrite: true });
  const [fetching, setFetching] = createSignal(false, { ownedWrite: true });

  let add: (el: Element) => void = noop;
  if (!isServer) {
    const io = new IntersectionObserver(e => {
      if (e.length > 0 && e[0]!.isIntersecting && !end() && !fetching()) {
        setPage(p => p + 1);
      }
    });
    onCleanup(() => io.disconnect());
    add = (el: Element) => {
      io.observe(el);
      tryOnCleanup(() => io.unobserve(el));
    };

    createEffect(
      () => page(),
      currentPage => {
        let cancelled = false;
        setFetching(true);
        fetcher(currentPage).then(content => {
          if (cancelled) return;
          if (content.length === 0) setEnd(true);
          setPages(p => [...p, ...content]);
          setFetching(false);
        });
        return () => {
          cancelled = true;
        };
      },
    );
  }

  return [
    pages,
    add,
    {
      page,
      setPage,
      setPages,
      end,
      setEnd,
    },
  ];
}
