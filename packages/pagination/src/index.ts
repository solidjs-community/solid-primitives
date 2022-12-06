import { type Accessor, type Setter, createSignal, type JSX, createMemo } from "solid-js";
import { access, type MaybeAccessor, noop } from "@solid-primitives/utils";

export type PaginationOptions = {
  pages: number;
  maxPages?: number;
  initialPage?: number;
  showDisabled?: boolean;
  showFirst?: boolean | ((page: number, pages: number) => boolean);
  firstContent?: JSX.Element;
  showPrev?: boolean | ((page: number, pages: number) => boolean);
  prevContent?: JSX.Element;
  showNext?: boolean | ((page: number, pages: number) => boolean);
  nextContent?: JSX.Element;
  showLast?: boolean | ((page: number, pages: number) => boolean);
  lastContent?: JSX.Element;
  multiJump?: number | number[];
};

export type PaginationProps = {
  "aria-current"?: boolean;
  disabled?: boolean;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
  onKeyUp?: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent>;
  children: JSX.Element;
  /** page number this refers to, not enumerable, allows to use props.page to get the page number */
  readonly page?: number
}[];

export const paginationDefaults = {
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
  lastContent: ">|"
} as const;

const normalizeOption = (
  key: "showFirst" | "showPrev" | "showNext" | "showLast",
  value: PaginationOptions["showFirst" | "showPrev" | "showNext" | "showLast"],
  page: number,
  pages: number
) =>
  typeof value === "boolean"
    ? value
    : typeof value === "function"
    ? value(page, pages)
    : paginationDefaults[key];

/**
 * Creates a reactive pagination to fill your layout with
 */
export const createPagination = (
  options?: MaybeAccessor<PaginationOptions>
): [props: Accessor<PaginationProps>, page: Accessor<number>, setPage: Setter<number>] => {
  const opts = createMemo(() => Object.assign({}, paginationDefaults, access(options)));
  const [page, _setPage] = createSignal(opts().initialPage || 1);
  const setPage = (p: number | ((_p: number) => number)) => {
    if (typeof p === "function") {
      p = p(page());
    }
    return p >= 1 && p <= opts().pages ? _setPage(p) : page();
  };
  if (process.env.SSR) {
    const pages: PaginationProps = [...Array(opts().pages)].map((_, i) =>
      ((pageNo: number) =>
        Object.defineProperties(
          { children: pageNo.toString() },
          {
            "aria-current": {
              get: () => (page() === pageNo ? "true" : undefined),
              set: noop,
              enumerable: true
            },
            "page": { value: pageNo, enumerable: false }
          },
        ))(i + 1)
    );
    const first = Object.defineProperties({} as PaginationProps[number], {
      disabled: { get: () => page() <= 1, set: noop, enumerable: true },
      children: { get: () => opts().firstContent, set: noop, enumerable: true },
      page: { value: 1, enumerable: false },
    });
    const back = Object.defineProperties({} as PaginationProps[number], {
      disabled: { get: () => page() <= 1, set: noop, enumerable: true },
      children: { get: () => opts().prevContent, set: noop, enumerable: true },
      page: { get: () => Math.min(1, page() - 1), enumerable: false },
    });
    const next = Object.defineProperties({} as PaginationProps[number], {
      disabled: { get: () => page() >= opts().pages, set: noop, enumerable: true },
      children: { get: () => opts().nextContent, set: noop, enumerable: true },
      page: { get: () => Math.max(opts().pages, page() + 1), enumerable: false },
    });
    const last = Object.defineProperties({} as PaginationProps[number], {
      disabled: { get: () => page() >= opts().pages, set: noop, enumerable: true },
      children: { get: () => opts().lastContent, set: noop, enumerable: true },
      page: { get: () => opts().pages, enumerable: false },
    });
    const paginationProps = createMemo<PaginationProps>(() => {
      const props = [];
      if (normalizeOption("showFirst", opts().showFirst, page(), opts().pages)) {
        props.push(first);
      }
      if (normalizeOption("showPrev", opts().showPrev, page(), opts().pages)) {
        props.push(back);
      }
      const start = Math.min(
        opts().pages - opts().maxPages,
        Math.max(1, page() - (opts().maxPages >> 1)) - 1
      );
      props.push(...pages.slice(start, start + opts().maxPages));
      if (normalizeOption("showNext", opts().showNext, page(), opts().pages)) {
        props.push(next);
      }
      if (normalizeOption("showLast", opts().showLast, page(), opts().pages)) {
        props.push(last);
      }
      return props;
    });
    return [paginationProps, page, setPage as Setter<number>];
  } else {
    const onKeyUp = (pageNo: number, ev: KeyboardEvent) =>
      ((
        {
          ArrowLeft: () => setPage(p => p - 1),
          ArrowRight: () => setPage(p => p + 1),
          Home: () => setPage(1),
          End: () => setPage(opts().pages),
          Space: () => setPage(pageNo),
          Return: () => setPage(pageNo)
        }[ev.key] || noop
      )());
    // create all pages so we can reuse the objects
    const pages: PaginationProps = [...Array(opts().pages)].map((_, i) =>
      ((pageNo: number) =>
        Object.defineProperties(
          {
            children: pageNo.toString(),
            onClick: [setPage, pageNo] as const,
            onKeyUp: [onKeyUp, pageNo] as const
          },
          {
            "aria-current": {
              get: () => (page() === pageNo ? "true" : undefined),
              set: noop,
              enumerable: true
            },
            "page": {
              value: pageNo,
              enumerable: false,
            },
          }
        ))(i + 1)
    );
    const first = Object.defineProperties({
      onClick: [setPage, 1] as const,
      onKeyUp: [onKeyUp, 1] as const,
    } as unknown as PaginationProps[number], {
      disabled: { get: () => page() <= 1, set: noop, enumerable: true },
      children: { get: () => opts().firstContent, set: noop, enumerable: true },
      page: { value: 1, enumerable: false },
    });
    const back = Object.defineProperties({
      onClick: () => setPage(p => (p > 1 ? p - 1 : p)),
      onKeyUp: (ev: KeyboardEvent) => onKeyUp(page() - 1, ev)
    } as unknown as PaginationProps[number], {
      disabled: { get: () => page() <= 1, set: noop, enumerable: true },
      children: { get: () => opts().prevContent, set: noop, enumerable: true },
      page: { get: () => Math.min(1, page() - 1), enumerable: false },
    });
    const next = Object.defineProperties({
      onClick: () => setPage(p => (p < opts().pages ? p + 1 : p)),
      onKeyUp: (ev: KeyboardEvent) => onKeyUp(page() - 1, ev)
    } as unknown as PaginationProps[number], {
      disabled: { get: () => page() >= opts().pages, set: noop, enumerable: true },
      children: { get: () => opts().nextContent, set: noop, enumerable: true },
      page: { get: () => Math.max(opts().pages, page() + 1), enumerable: false },
    });
    const last = Object.defineProperties({
      onClick: () => setPage(opts().pages),
      onKeyUp: (ev: KeyboardEvent) => onKeyUp(opts().pages, ev)
    } as unknown as PaginationProps[number], {
      disabled: { get: () => page() >= opts().pages, set: noop, enumerable: true },
      children: { get: () => opts().lastContent, set: noop, enumerable: true },
      page: { get: () => opts().pages, enumerable: false },
    });
    const paginationProps = createMemo<PaginationProps>(() => {
      const props = [];
      if (normalizeOption("showFirst", opts().showFirst, page(), opts().pages)) {
        props.push(first);
      }
      if (normalizeOption("showPrev", opts().showPrev, page(), opts().pages)) {
        props.push(back);
      }
      const start = Math.min(
        opts().pages - opts().maxPages,
        Math.max(1, page() - (opts().maxPages >> 1)) - 1
      );
      props.push(...pages.slice(start, start + opts().maxPages));
      if (normalizeOption("showNext", opts().showNext, page(), opts().pages)) {
        props.push(next);
      }
      if (normalizeOption("showLast", opts().showLast, page(), opts().pages)) {
        props.push(last);
      }
      return props;
    });
    return [paginationProps, page, setPage as Setter<number>];
  }
};
