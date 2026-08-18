import { type Accessor, createEffect, createSignal, onCleanup, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, INTERNAL_OPTIONS, type MaybeAccessor, noop } from "@solid-primitives/utils";
import { bindFaviconLink, type FaviconController, type FaviconOptions } from "./link.ts";

/**
 * Sets the document's favicon to `href`, restoring whatever href (or absence of a link element)
 * was there before once `dispose()` is called.
 *
 * Non-reactive: `href` is a plain string. For a reactive, auto-disposing version see
 * {@link createFavicon}.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#makeFavicon
 * @example
 * const favicon = makeFavicon("/favicon-dark.svg");
 * favicon.setHref("/favicon-light.svg");
 * favicon.dispose(); // restores the previous favicon
 */
export function makeFavicon(href: string, options: FaviconOptions = {}): FaviconController {
  if (isServer) {
    return { href, setHref: noop, dispose: noop };
  }
  return bindFaviconLink(options.rel ?? "icon", href);
}

/**
 * Reactively sets the document's favicon to `href`. Restores the previous favicon on cleanup.
 *
 * @param href a url/path, or an accessor returning one, to apply as the favicon
 * @returns an accessor of the currently-applied favicon href
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#createFavicon
 * @example
 * const href = createFavicon(() => (unreadCount() > 0 ? "/favicon-alert.svg" : "/favicon.svg"));
 */
export function createFavicon(
  href: MaybeAccessor<string>,
  options: FaviconOptions = {},
): Accessor<string> {
  if (isServer) {
    return () => access(href);
  }

  // `untrack` — this initial read must not happen as a top-level tracked read (it isn't inside
  // JSX, a memo, or an effect's compute phase), or Solid's dev-mode diagnostics flag it as
  // `STRICT_READ_UNTRACKED`.
  const favicon = makeFavicon(
    untrack(() => access(href)),
    options,
  );
  // A real signal, not just `() => favicon.href` — reading a plain DOM property from JSX
  // registers no dependency, so it would never re-render when the href changes underneath it.
  const [current, setCurrent] = createSignal(favicon.href, INTERNAL_OPTIONS);

  if (typeof href === "function") {
    // `defer: true` — the initial value was already applied synchronously above via `makeFavicon`.
    createEffect(
      () => href(),
      value => {
        favicon.setHref(value);
        setCurrent(favicon.href);
      },
      { defer: true },
    );
  }

  onCleanup(favicon.dispose);

  return current;
}
