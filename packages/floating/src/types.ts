export type Side = "top" | "right" | "bottom" | "left";
export type Alignment = "start" | "end";
export type Placement = Side | `${Side}-${Alignment}`;
export type Strategy = "absolute" | "fixed";

export type Point = { x: number; y: number };
export type Size = { width: number; height: number };
export type Rect = Point & Size;
export type Sides = { top: number; right: number; bottom: number; left: number };
/** A single number applies to all four sides. */
export type Padding = number | Partial<Sides>;

/** Anything with a bounding box: a DOM element, or a virtual anchor such as the cursor. */
export type VirtualElement = {
  getBoundingClientRect(): {
    x?: number;
    y?: number;
    left?: number;
    top?: number;
    width: number;
    height: number;
  };
  /** Used by `makeAutoUpdate` to find scrollable ancestors for a virtual anchor. */
  contextElement?: Element;
};
export type ReferenceElement = Element | VirtualElement;

export type OffsetOptions = number | { mainAxis?: number; crossAxis?: number };

export type FlipOptions = {
  /**
   * Placements to try, in order, when the preferred one overflows.
   * Defaults to the opposite side with the same alignment.
   */
  fallbackPlacements?: readonly Placement[];
  /** Distance kept between the floating element and the boundary. Default `0`. */
  padding?: Padding;
};

export type ShiftOptions = {
  /** Distance kept between the floating element and the boundary. Default `0`. */
  padding?: Padding;
  /** Shift along the axis perpendicular to the placement side. Default `true`. */
  crossAxis?: boolean;
  /** Shift along the placement axis, letting the element overlap the reference. Default `false`. */
  mainAxis?: boolean;
  /**
   * Keep the floating element attached to the reference: shifting never moves it past the
   * reference edges. `true` or `{ offset }` (distance that must stay overlapping).
   */
  limit?: boolean | { offset?: number };
};

export type SizeApplyArgs = {
  availableWidth: number;
  availableHeight: number;
  transformOrigin: string;
  placement: Placement;
  elements: { reference: ReferenceElement; floating: HTMLElement };
};

export type SizeOptions = {
  /** Distance kept between the floating element and the boundary. Default `0`. */
  padding?: Padding;
  /**
   * Called after the position is solved. Mutating the floating element's size here makes
   * `computePosition` measure again and re-solve once.
   */
  apply?: (args: SizeApplyArgs) => void;
};

export type ArrowOptions = {
  element: Element | null | undefined;
  /** Minimum distance between the arrow and the floating element's edges. Default `0`. */
  padding?: number;
};

export type Boundary = Element | readonly Element[] | Rect;
export type RootBoundary = "viewport" | "document" | Rect;

export type PositionOptions = {
  /** Default `"bottom"`. */
  placement?: Placement;
  /** Default `"absolute"`. */
  strategy?: Strategy;
  /** Flips what `-start` / `-end` mean on top and bottom placements. */
  rtl?: boolean;
  offset?: OffsetOptions;
  /** Opt in with `true` or options. */
  flip?: boolean | FlipOptions;
  /** Opt in with `true` or options. */
  shift?: boolean | ShiftOptions;
  size?: SizeOptions;
  /** Elements (or a rect, in viewport coordinates) the floating element must stay within. */
  boundary?: Boundary;
  /** Default `"viewport"`, using `visualViewport` when available. */
  rootBoundary?: RootBoundary;
};

export type ComputePositionOptions = PositionOptions & {
  arrow?: ArrowOptions;
};

export type ArrowData = {
  /** Set for top/bottom placements. */
  x?: number;
  /** Set for left/right placements. */
  y?: number;
  /** Non-zero when the arrow had to be clamped and no longer points at the reference center. */
  centerOffset: number;
};

export type MiddlewareData = {
  arrow?: ArrowData;
  /** The final placement differs from the requested one. */
  flipped: boolean;
  /** The floating element was moved by `shift`. */
  shifted: boolean;
  /** How far `shift` moved the element on each axis. */
  shift: Point;
  /** Space between the floating element's start and the boundary edge, in px. */
  availableWidth: number;
  availableHeight: number;
  /** Origin pointing at the reference (or arrow) center, e.g. `"24px 0px"`. */
  transformOrigin: string;
};

export type ComputePositionResult = {
  x: number;
  y: number;
  placement: Placement;
  strategy: Strategy;
  middlewareData: MiddlewareData;
};
