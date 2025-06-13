import { access, tryOnCleanup, noop, type MaybeAccessor } from "@solid-primitives/utils";
import {
  Accessor,
  batch,
  JSX,
  Setter,
  createComputed,
  createMemo,
  createResource,
  createSignal,
  onCleanup,
} from "solid-js";
import { isServer } from "solid-js/web";

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
  const [page, _setPage] = createSignal(opts().initialPage || 1);
  const setPage = (p: number | ((_p: number) => number)) => {
    if (typeof p === "function") {
      p = p(page());
    }
    return p >= 1 && p <= opts().pages ? _setPage(p) : page();
  };

  const onKeyUp = (pageNo: number, ev: KeyboardEvent) =>
    (
      ({
        ArrowLeft: () => setPage(p => p - 1),
        ArrowRight: () => setPage(p => p + 1),
        Home: () => setPage(1),
        End: () => setPage(opts().pages),
        Space: () => setPage(pageNo),
        Return: () => setPage(pageNo),
      })[ev.key] || noop
    )();

  const maxPages = createMemo(() => Math.min(opts().maxPages, opts().pages));

  const pages = createMemo<PaginationProps>(
    previous =>
      [...Array(opts().pages)].map(
        (_, i) =>
          previous[i] ||
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
    [],
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
    if (showPrev()) {
      props.push(back);
    }
    props.push(...pages().slice(start(), start() + maxPages()));
    if (showNext()) {
      props.push(next);
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
 * A SolidJS utility to create an infinite scrolling experience with IntersectionObserver and reactivity.
 *
 * This function handles page fetching, auto-incrementing on scroll, error tracking, and supports
 * dynamic parameters for API requests. It returns an accessor for the loaded pages, a directive
 * to attach to a loader DOM element, and control state for pagination.
 *
 * ### Usage Example:
 * ```ts
 * const [pages, loader, { page, setPage, setPages, end, setEnd }] = createInfiniteScroll(fetcher, {
 *   params: () => ({ query: 'search-term' }),
 *   resetOnParamsChange: true
 * });
 * ```
 *
 * @template T - The type of individual page items (e.g., object, string).
 * @template E - (Optional) The error type. Defaults to `unknown`.
 * @template P - (Optional) The type of dynamic fetcher parameters.
 *
 * @param {function(page: number, params: P): Promise<T[]>} fetcher
 *    A function that takes a page number and optional parameters and returns a Promise resolving to an array of items.
 *
 * @param {Object} [options] - Optional configuration object.
 * @param {() => P} [options.params] - A reactive accessor for dynamic fetcher parameters.
 * @param {boolean} [options.resetOnParamsChange=true] - Whether to reset state (pages, page, end) when parameters change.
 *
 * @returns {[Accessor<T[]>, (el: Element) => void, {
 *   page: Accessor<number>,
 *   setPage: Setter<number>,
 *   setPages: Setter<T[]>,
 *   end: Accessor<boolean>,
 *   setEnd: Setter<boolean>,
 *   error: Accessor<Error | null>,
 *   loading: Accessor<boolean>
 * }]} A tuple:
 * - `pages`: an accessor for the full list of loaded items.
 * - `loader`: a directive function that should be attached to the DOM element used as the intersection trigger (e.g., a loading spinner).
 * - `state`: an object with methods and accessors for managing pagination state.
 *
 * @property {Accessor<number>} page - Current page number accessor.
 * @property {Setter<number>} setPage - Function to manually set the current page number.
 * @property {Setter<T[]>} setPages - Function to manually set the entire list of loaded items.
 * @property {Accessor<boolean>} end - Accessor that indicates if the end of available content has been reached.
 * @property {Setter<boolean>} setEnd - Function to manually set the end state.
 * @property {Accessor<Error | null>} error - Accessor for any error encountered during fetching.
 * @property {Accessor<boolean>} loading - Accessor for the current loading state.
 */
export function createInfiniteScroll<T, E = unknown, P = unknown>(
    fetcher: (page: number, params: P) => Promise<T[]>,
    options?: InfiniteScrollOptions<P>
): [
    pages: Accessor<T[]>,
    loader: (el: Element) => void,
    state: {
        page: Accessor<number>
        setPage: Setter<number>
        setPages: Setter<T[]>
        end: Accessor<boolean>
        setEnd: Setter<boolean>
        error: Accessor<Error | null>
        loading: Accessor<boolean>
    }
] {
    const [pages, setPages] = createSignal<T[]>([])
    const [page, setPage] = createSignal(0)
    const [end, setEnd] = createSignal(false)
    const [error, setError] = createSignal<Error | null>(null)

    // Fix: Handle undefined options by providing defaults
    const { params, resetOnParamsChange = true } = options || {}

    const [contents] = createResource(
        () => [page(), params?.()] as const,
        async ([p, param]) => {
            setError(null)
            try {
                const result = await fetcher(p, param)
                return result
            } catch (e) {
                setError(e as Error)
                console.error(e)
                return []
            }
        }
    )

    createComputed(() => {
        const content = contents()
        if (!content) return
        batch(() => {
            if (content.length === 0) setEnd(true)
            setPages((prev) => [...prev, ...content])
        })
    })

    // Reset state if params change
    createComputed(() => {
        if (params) {
            params()
            if (resetOnParamsChange) {
                batch(() => {
                    setPages([])
                    setPage(0)
                    setEnd(false)
                })
            }
        }
    })

    let add: (el: Element) => void = () => {}
    let currentObservedElement: Element | null = null

    if (!isServer) {
        const io = new IntersectionObserver(
            (entries) => {
                const entry = entries[0]
                if (
                    entry?.isIntersecting &&
                    !end() &&
                    !contents.loading
                ) {
                    setPage((p) => p + 1)
                }
            },
            {
                rootMargin: '50px'
            }
        )

        onCleanup(() => io.disconnect())

        add = (el: Element) => {
            // Unobserve the previous element if it exists
            if (currentObservedElement) {
                io.unobserve(currentObservedElement)
            }

            // Observe the new last element
            io.observe(el)
            currentObservedElement = el

            tryOnCleanup(() => {
                io.unobserve(el)
                if (currentObservedElement === el) {
                    currentObservedElement = null
                }
            })
        }
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
            error,
            loading: () => contents.loading
        },
    ]
}
