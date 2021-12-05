export * from "./mousePosition";
export * from "./mouseOnScreen";
export * from "./mouseInElement";
export * from "./mouseToElement";

export interface Position {
  x: number;
  y: number;
}
export interface RelativeToElementValues extends Position {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Turn position relative to the page, into position relative to an element.
 */
export const posRelativeToElement = (
  pageX: number,
  pageY: number,
  el: Element
): RelativeToElementValues => {
  const bounds = el.getBoundingClientRect(),
    top = bounds.top + window.screenY,
    left = bounds.left + window.scrollX;
  return {
    x: pageX - left,
    y: pageY - top,
    top,
    left,
    width: bounds.width,
    height: bounds.height
  };
};

/**
 * Turn position relative to the page, into position relative to the screen.
 */
export const posRelativeToScreen = (pageX: number, pageY: number): Position => ({
  x: pageX - window.scrollX,
  y: pageY - window.screenY
});
