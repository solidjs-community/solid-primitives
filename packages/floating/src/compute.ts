import type {
  Alignment,
  ArrowData,
  ComputePositionOptions,
  ComputePositionResult,
  Padding,
  Placement,
  Point,
  PositionOptions,
  Rect,
  ReferenceElement,
  Side,
  Sides,
  Size,
  Strategy,
} from "./types.ts";

const OPPOSITE: Record<Side, Side> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export const getSide = (placement: Placement): Side => placement.split("-")[0] as Side;
export const getAlignment = (placement: Placement): Alignment | undefined =>
  placement.split("-")[1] as Alignment | undefined;

/** Swaps the side, keeps the alignment: `top-start` -> `bottom-start`. */
export const getOppositePlacement = (placement: Placement): Placement => {
  const alignment = getAlignment(placement);
  const side = OPPOSITE[getSide(placement)];
  return (alignment ? `${side}-${alignment}` : side) as Placement;
};

/** `true` for top/bottom placements, where the cross axis is horizontal. */
const isVerticalPlacement = (side: Side): boolean => side === "top" || side === "bottom";

const clamp = (min: number, value: number, max: number): number =>
  Math.max(min, Math.min(value, max));

export function normalizePadding(padding: Padding | undefined): Sides {
  if (typeof padding === "number")
    return { top: padding, right: padding, bottom: padding, left: padding };
  return { top: 0, right: 0, bottom: 0, left: 0, ...padding };
}

type RectLike = {
  x?: number;
  y?: number;
  left?: number;
  top?: number;
  width: number;
  height: number;
};

export const toRect = (r: RectLike): Rect => ({
  x: r.x ?? r.left ?? 0,
  y: r.y ?? r.top ?? 0,
  width: r.width,
  height: r.height,
});

/** Intersection of two rects; never negative in size. */
function intersect(a: Rect, b: Rect): Rect {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return { x, y, width: Math.max(0, right - x), height: Math.max(0, bottom - y) };
}

/** Coordinates of the floating element's top-left corner for one placement, offset included. */
function getCoords(
  ref: Rect,
  fl: Size,
  placement: Placement,
  rtl: boolean,
  mainAxisOffset: number,
  crossAxisOffset: number,
): Point {
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const vertical = isVerticalPlacement(side);

  const commonX = ref.x + ref.width / 2 - fl.width / 2;
  const commonY = ref.y + ref.height / 2 - fl.height / 2;

  let x: number;
  let y: number;
  switch (side) {
    case "top":
      x = commonX;
      y = ref.y - fl.height;
      break;
    case "bottom":
      x = commonX;
      y = ref.y + ref.height;
      break;
    case "right":
      x = ref.x + ref.width;
      y = commonY;
      break;
    default:
      x = ref.x - fl.width;
      y = commonY;
  }

  // Alignment moves the element along the cross axis. In RTL, top/bottom start is the right edge.
  const flip = rtl && vertical ? -1 : 1;
  if (alignment) {
    const common = vertical
      ? (ref.width / 2 - fl.width / 2) * flip
      : ref.height / 2 - fl.height / 2;
    const dir = alignment === "start" ? -1 : 1;
    if (vertical) x += dir * common;
    else y += dir * common;
  }

  const main = side === "top" || side === "left" ? -mainAxisOffset : mainAxisOffset;
  const cross = (alignment === "end" ? -crossAxisOffset : crossAxisOffset) * flip;
  if (vertical) {
    x += cross;
    y += main;
  } else {
    x += main;
    y += cross;
  }
  return { x, y };
}

/** How far the element sticks out past each clipping edge. Positive means overflowing. */
function getOverflow(coords: Point, fl: Size, clip: Rect, padding: Sides): Sides {
  return {
    top: clip.y - coords.y + padding.top,
    bottom: coords.y + fl.height - (clip.y + clip.height) + padding.bottom,
    left: clip.x - coords.x + padding.left,
    right: coords.x + fl.width - (clip.x + clip.width) + padding.right,
  };
}

export type SolveExtras = {
  /** Viewport coordinates of the origin that `x`/`y` are measured from. Default `{0, 0}`. */
  origin?: Point;
  /**
   * Scale of the coordinate space `x`/`y` are measured in (viewport px per local CSS px).
   * Default `{1, 1}`. Results and px metadata are converted to local CSS px.
   */
  scale?: Point;
  /** Arrow element size and padding; enables `middlewareData.arrow`. */
  arrow?: Size & { padding?: number };
};

/**
 * Pure geometry: all rects are in the same coordinate space (viewport coordinates when called
 * through `computePosition`). No DOM access, no reactivity.
 *
 * @param reference reference rect
 * @param floating floating element size
 * @param clipping rect the floating element should stay within
 */
export function computePositionFromRects(
  reference: Rect,
  floating: Size,
  clipping: Rect,
  options: PositionOptions = {},
  extras: SolveExtras = {},
): ComputePositionResult {
  const initialPlacement = options.placement ?? "bottom";
  const strategy: Strategy = options.strategy ?? "absolute";
  const rtl = options.rtl ?? false;
  const origin = extras.origin ?? { x: 0, y: 0 };
  const scale = extras.scale ?? { x: 1, y: 1 };

  const offset =
    typeof options.offset === "number"
      ? { mainAxis: options.offset, crossAxis: 0 }
      : { mainAxis: options.offset?.mainAxis ?? 0, crossAxis: options.offset?.crossAxis ?? 0 };

  const coordsFor = (placement: Placement) =>
    getCoords(reference, floating, placement, rtl, offset.mainAxis, offset.crossAxis);

  // --- flip ---
  let placement = initialPlacement;
  let coords = coordsFor(placement);
  const flipOptions = options.flip === true ? {} : options.flip || undefined;
  if (flipOptions) {
    const padding = normalizePadding(flipOptions.padding);
    const candidates = [
      initialPlacement,
      ...(flipOptions.fallbackPlacements ?? [getOppositePlacement(initialPlacement)]),
    ].filter((p, i, all) => all.indexOf(p) === i);
    let best: { placement: Placement; coords: Point; overflow: number } | undefined;
    let fits = false;
    for (const candidate of candidates) {
      const c = coordsFor(candidate);
      const overflow = getOverflow(c, floating, clipping, padding)[getSide(candidate)];
      if (overflow <= 0) {
        placement = candidate;
        coords = c;
        fits = true;
        break;
      }
      if (!best || overflow < best.overflow) best = { placement: candidate, coords: c, overflow };
    }
    if (!fits && best) {
      placement = best.placement;
      coords = best.coords;
    }
  }

  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const vertical = isVerticalPlacement(side);

  // --- shift ---
  const shiftOptions = options.shift === true ? {} : options.shift || undefined;
  const shift: Point = { x: 0, y: 0 };
  if (shiftOptions) {
    const padding = normalizePadding(shiftOptions.padding);
    const limit = shiftOptions.limit === true ? {} : shiftOptions.limit || undefined;
    const axes: ("x" | "y")[] = [];
    const crossAxis = vertical ? "x" : "y";
    const mainAxis = vertical ? "y" : "x";
    if (shiftOptions.crossAxis ?? true) axes.push(crossAxis);
    if (shiftOptions.mainAxis ?? false) axes.push(mainAxis);
    for (const axis of axes) {
      const len = axis === "x" ? "width" : "height";
      const [startPad, endPad] =
        axis === "x" ? [padding.left, padding.right] : [padding.top, padding.bottom];
      const min = clipping[axis] + startPad;
      const max = clipping[axis] + clipping[len] - endPad - floating[len];
      const original = coords[axis];
      let value = clamp(min, original, max);
      if (limit) {
        const limitOffset = limit.offset ?? 0;
        // The unshifted coordinate always stays reachable: limiting only restricts the shift.
        const lo = Math.min(reference[axis] - floating[len] + limitOffset, original);
        const hi = Math.max(reference[axis] + reference[len] - limitOffset, original);
        value = clamp(lo, value, hi);
      }
      shift[axis] = value - original;
      coords = { ...coords, [axis]: value };
    }
  }

  // --- size / available space ---
  const sizePadding = normalizePadding(options.size?.padding);
  const overflow = getOverflow(coords, floating, clipping, sizePadding);
  let heightSide: "top" | "bottom";
  let widthSide: "left" | "right";
  if (vertical) {
    heightSide = side as "top" | "bottom";
    widthSide = alignment === (rtl ? "start" : "end") ? "left" : "right";
  } else {
    widthSide = side as "left" | "right";
    heightSide = alignment === "end" ? "top" : "bottom";
  }
  const availableHeight = Math.max(
    0,
    Math.min(
      floating.height - overflow[heightSide],
      floating.height - overflow.top - overflow.bottom,
    ),
  );
  const availableWidth = Math.max(
    0,
    Math.min(floating.width - overflow[widthSide], floating.width - overflow.left - overflow.right),
  );

  // --- arrow ---
  let arrow: ArrowData | undefined;
  let arrowCenter: number | undefined;
  if (extras.arrow) {
    const axis = vertical ? "x" : "y";
    const len = vertical ? "width" : "height";
    const arrowLen = extras.arrow[len];
    const desired = reference[axis] + reference[len] / 2 - coords[axis] - arrowLen / 2;
    // Padding never exceeds half the free space, or the clamp range would invert and pin the
    // arrow to the start edge. With no free space (arrow bigger than the box) it overflows from
    // the start edge.
    const space = floating[len] - arrowLen;
    const pad = Math.max(0, Math.min(extras.arrow.padding ?? 0, space / 2));
    const clamped = clamp(pad, desired, space - pad);
    const k = scale[axis];
    arrow = { [axis]: clamped / k, centerOffset: (desired - clamped) / k } as ArrowData;
    arrowCenter = clamped + arrowLen / 2;
  }

  // --- transform origin ---
  const crossAxisKey = vertical ? "x" : "y";
  const crossLen = vertical ? "width" : "height";
  const crossOrigin =
    arrowCenter ??
    clamp(
      0,
      reference[crossAxisKey] + reference[crossLen] / 2 - coords[crossAxisKey],
      floating[crossLen],
    );
  const mainOrigin = side === "top" ? floating.height : side === "left" ? floating.width : 0;
  const transformOrigin = vertical
    ? `${crossOrigin / scale.x}px ${mainOrigin / scale.y}px`
    : `${mainOrigin / scale.x}px ${crossOrigin / scale.y}px`;

  return {
    x: (coords.x - origin.x) / scale.x,
    y: (coords.y - origin.y) / scale.y,
    placement,
    strategy,
    middlewareData: {
      ...(arrow && { arrow }),
      flipped: placement !== initialPlacement,
      shifted: shift.x !== 0 || shift.y !== 0,
      shift: { x: shift.x / scale.x, y: shift.y / scale.y },
      availableWidth: availableWidth / scale.x,
      availableHeight: availableHeight / scale.y,
      transformOrigin,
    },
  };
}

// ---------- DOM measuring ----------

function getViewportRect(doc: Document): Rect {
  const win = doc.defaultView;
  const vv = win?.visualViewport;
  if (vv) return { x: vv.offsetLeft, y: vv.offsetTop, width: vv.width, height: vv.height };
  const el = doc.documentElement;
  return {
    x: 0,
    y: 0,
    width: el.clientWidth || win?.innerWidth || 0,
    height: el.clientHeight || win?.innerHeight || 0,
  };
}

function getDocumentRect(doc: Document): Rect {
  const win = doc.defaultView;
  const el = doc.documentElement;
  return {
    x: -(win?.scrollX ?? 0),
    y: -(win?.scrollY ?? 0),
    width: Math.max(el.scrollWidth, el.clientWidth),
    height: Math.max(el.scrollHeight, el.clientHeight),
  };
}

const isRect = (value: unknown): value is Rect =>
  typeof value === "object" &&
  value !== null &&
  "width" in value &&
  !("getBoundingClientRect" in value);

/** The rect, in viewport coordinates, that the floating element has to stay within. */
export function getClippingRect(
  floating: Element,
  boundary: PositionOptions["boundary"],
  rootBoundary: PositionOptions["rootBoundary"] = "viewport",
): Rect {
  const doc = floating.ownerDocument;
  let rect: Rect =
    rootBoundary === "viewport"
      ? getViewportRect(doc)
      : rootBoundary === "document"
        ? getDocumentRect(doc)
        : rootBoundary;
  if (boundary) {
    const rects = isRect(boundary)
      ? [boundary]
      : (Array.isArray(boundary) ? boundary : [boundary]).map((el: Element) =>
          toRect(el.getBoundingClientRect()),
        );
    for (const r of rects) rect = intersect(rect, r);
  }
  return rect;
}

const ORIGIN_ZERO: Point = { x: 0, y: 0 };
const SCALE_ONE: Point = { x: 1, y: 1 };

/** Flat-tree parent: slot assignment and shadow hosts are followed, iframes are not. */
function getParentElement(el: Element): Element | null {
  if (el.assignedSlot) return el.assignedSlot;
  if (el.parentElement) return el.parentElement;
  const root = el.parentNode as (ParentNode & { host?: Element }) | null;
  return root?.host ?? null;
}

/**
 * Whether an element is the containing block of its `position: fixed` and `position: absolute`
 * descendants without being positioned itself: transform (including the individual `translate`,
 * `rotate`, `scale` properties), perspective, filter, backdrop-filter, a matching `will-change`,
 * or paint / layout containment. `container-type` is deliberately absent: it only applies style
 * and size containment (css-conditional-5), not layout containment.
 */
const establishesContainingBlock = (style: CSSStyleDeclaration): boolean => {
  const none = (v: string | undefined) => !v || v === "none";
  const s = style as CSSStyleDeclaration & { webkitBackdropFilter?: string };
  return (
    !none(s.transform) ||
    !none(s.translate) ||
    !none(s.rotate) ||
    !none(s.scale) ||
    !none(s.perspective) ||
    !none(s.filter) ||
    !none(s.backdropFilter) ||
    !none(s.webkitBackdropFilter) ||
    /transform|translate|rotate|scale|perspective|filter/.test(s.willChange || "") ||
    /paint|layout|strict|content/.test(s.contain || "")
  );
};

const safeStyle = (win: Window, el: Element): CSSStyleDeclaration | undefined => {
  try {
    return win.getComputedStyle(el);
  } catch {
    return undefined;
  }
};

/** The nearest ancestor that is the containing block of `position: fixed` descendants. */
function getFixedContainingBlock(floating: Element): Element | null {
  const win = floating.ownerDocument.defaultView;
  if (!win?.getComputedStyle) return null;
  for (let el = getParentElement(floating); el; el = getParentElement(el)) {
    let style: CSSStyleDeclaration | undefined;
    try {
      style = win.getComputedStyle(el);
    } catch {
      return null;
    }
    if (style && establishesContainingBlock(style)) return el;
  }
  return null;
}

/**
 * Viewport px per local CSS px; `1` when the element has no layout size or is not scaled.
 *
 * Scale is inferred from `rect.width / offsetWidth`. `offsetWidth` is rounded to an integer, so a
 * difference of up to 1px is treated as rounding (fractional layout) and snaps to 1. Limitation:
 * a real transform that changes the size by 1px or less is indistinguishable from rounding.
 */
function getScale(el: Element, rect: DOMRect): Point {
  const { offsetWidth, offsetHeight } = el as HTMLElement;
  const ratio = (measured: number, css: number) => {
    if (!css || Math.abs(measured - css) <= 1) return 1;
    const r = measured / css;
    return Number.isFinite(r) && r > 0 ? r : 1;
  };
  return { x: ratio(rect.width, offsetWidth), y: ratio(rect.height, offsetHeight) };
}

/**
 * Viewport origin (and scale) of a block's padding box content, scroll included. The scroll offsets
 * of `documentElement` (and of `body` in quirks mode) are the viewport's scroll: that is not box
 * scrolling, and the box's rect has already moved with it, so they are not subtracted.
 */
function getBlockOriginAndScale(block: Element): { origin: Point; scale: Point } {
  const doc = block.ownerDocument;
  const rect = block.getBoundingClientRect();
  const scale = getScale(block, rect);
  const viewportScroller =
    block === doc.documentElement || (block === doc.body && doc.compatMode === "BackCompat");
  const scrollLeft = viewportScroller ? 0 : block.scrollLeft;
  const scrollTop = viewportScroller ? 0 : block.scrollTop;
  return {
    origin: {
      x: rect.left + (block.clientLeft - scrollLeft) * scale.x,
      y: rect.top + (block.clientTop - scrollTop) * scale.y,
    },
    scale,
  };
}

/**
 * Viewport coordinates of the point that the floating element's `x` / `y` are measured from, and
 * the scale of that coordinate space. For `"fixed"` this is the viewport unless a transformed
 * (or filtered / contained) ancestor is the containing block.
 */
export function getOriginAndScale(
  floating: HTMLElement,
  strategy: Strategy,
): { origin: Point; scale: Point } {
  const doc = floating.ownerDocument;
  const win = doc.defaultView;
  if (strategy === "fixed") {
    const block = getFixedContainingBlock(floating);
    return block ? getBlockOriginAndScale(block) : { origin: ORIGIN_ZERO, scale: SCALE_ONE };
  }
  const parent = floating.offsetParent;
  const root = doc.documentElement;
  const staticBody =
    !!parent && !!win && parent === doc.body && safeStyle(win, parent)?.position === "static";
  if (!parent || parent === root || staticBody) {
    // No positioned ancestor: the initial containing block (the document), unless body (when it
    // is the static offset parent) or the root element itself establishes a containing block.
    if (win) {
      for (const el of staticBody && parent ? [parent, root] : [root]) {
        const style = safeStyle(win, el);
        if (style && establishesContainingBlock(style)) return getBlockOriginAndScale(el);
      }
    }
    return { origin: { x: -(win?.scrollX ?? 0), y: -(win?.scrollY ?? 0) }, scale: SCALE_ONE };
  }
  return getBlockOriginAndScale(parent);
}

/** Viewport coordinates of the point that `x` / `y` are measured from. */
export const getOrigin = (floating: HTMLElement, strategy: Strategy): Point =>
  getOriginAndScale(floating, strategy).origin;

const measure = (el: HTMLElement | Element): Size => {
  const { width, height } = el.getBoundingClientRect();
  return { width, height };
};

/**
 * Computes where to place `floating` relative to `reference`. Non-reactive and safe to call
 * from anywhere with mounted elements; the caller applies the result.
 *
 * `x` / `y` are relative to the floating element's offset parent for `"absolute"`, and to the
 * viewport for `"fixed"`.
 */
export function computePosition(
  reference: ReferenceElement,
  floating: HTMLElement,
  options: ComputePositionOptions = {},
): ComputePositionResult {
  const strategy = options.strategy ?? "absolute";
  const rtl =
    options.rtl ??
    floating.ownerDocument.defaultView?.getComputedStyle(floating).direction === "rtl";
  const solveOptions = { ...options, strategy, rtl };

  const solve = (): ComputePositionResult => {
    const { origin, scale } = getOriginAndScale(floating, strategy);
    return computePositionFromRects(
      toRect(reference.getBoundingClientRect()),
      measure(floating),
      getClippingRect(floating, options.boundary, options.rootBoundary),
      solveOptions,
      {
        origin,
        scale,
        arrow: options.arrow?.element
          ? { ...measure(options.arrow.element), padding: options.arrow.padding }
          : undefined,
      },
    );
  };

  let result = solve();
  const apply = options.size?.apply;
  if (apply) {
    const before = measure(floating);
    apply({
      availableWidth: result.middlewareData.availableWidth,
      availableHeight: result.middlewareData.availableHeight,
      transformOrigin: result.middlewareData.transformOrigin,
      placement: result.placement,
      elements: { reference, floating },
    });
    const after = measure(floating);
    if (after.width !== before.width || after.height !== before.height) result = solve();
  }
  return result;
}
