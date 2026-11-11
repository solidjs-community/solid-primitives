import type { Component } from "solid-js";
import type { FaviconOptions } from "./link.ts";

export type FaviconLinkProps = {
  /** The favicon href to render. Pass a value, not an accessor — call it at the JSX boundary. */
  href: string;
} & FaviconOptions;

/**
 * Renders the favicon `<link>` element directly, so its initial `href` is part of the server-
 * rendered HTML instead of only being applied once client JS hydrates. Place it once in your
 * document's actual `<head>` region (e.g. your SSR framework's root document/`<Head>` component —
 * not your regular app body tree, since a `<link>` rendered there wouldn't live in `<head>` at
 * all) alongside a `make*`/`create*` call anywhere else in the app: `bindFaviconLink`'s existing
 * "reuse an existing link" lookup finds and takes over this exact element once it runs
 * client-side, so nothing else needs to change to compose the two.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/favicon#FaviconLink
 * @example
 * function Head() {
 *   const scheme = createFaviconScheme({ light: "/icon-light.svg", dark: "/icon-dark.svg" });
 *   return <FaviconLink href={scheme.href()} />;
 * }
 */
export const FaviconLink: Component<FaviconLinkProps> = props => (
  <link rel={props.rel ?? "icon"} href={props.href} />
);
