import type * as API from "./index";

export const getScrollParent: typeof API.getScrollParent = () => ({} as Element);
export const isScrollable: typeof API.isScrollable = () => false;

export const getScrollPosition: typeof API.getScrollPosition = () => ({ x: 0, y: 0 });

export const createScrollPosition: typeof API.createScrollPosition = () => ({ x: 0, y: 0 });

export const useWindowScrollPosition: typeof API.useWindowScrollPosition = () => ({ x: 0, y: 0 });
