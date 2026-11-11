export type { FaviconController, FaviconOptions, FaviconRel } from "./link.ts";
export { makeFavicon, createFavicon } from "./favicon.ts";
export {
  makeFaviconAnimation,
  createFaviconAnimation,
  type FaviconAnimationOptions,
  type FaviconAnimationController,
} from "./animation.ts";
export {
  makeFaviconBadge,
  createFaviconBadge,
  type FaviconBadgeValue,
  type FaviconBadgePosition,
  type FaviconBadgeOptions,
} from "./badge.ts";
export {
  makeFaviconScheme,
  createFaviconScheme,
  type FaviconColorScheme,
  type FaviconSchemeIcons,
  type FaviconSchemeController,
} from "./scheme.ts";
export {
  makeFaviconProgress,
  createFaviconProgress,
  type FaviconProgressOptions,
} from "./progress.ts";
export { FaviconLink, type FaviconLinkProps } from "./components.tsx";
