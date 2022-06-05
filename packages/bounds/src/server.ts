import type * as API from "./index";

export const getElementBounds: typeof API.getElementBounds = () => ({
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  width: 0,
  height: 0
});

export const createElementBounds: typeof API.createElementBounds = () =>
  getElementBounds(void 0) as any;
