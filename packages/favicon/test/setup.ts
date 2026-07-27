/**
 * jsdom implements neither a real 2D canvas context nor real image decoding. Both are mocked here
 * so `createFaviconBadge`'s load-then-draw pipeline resolves deterministically: `getContext("2d")`
 * returns a fake context that records every draw call onto the canvas instance, `toDataURL()`
 * derives a stable string from that call log, and `HTMLImageElement`'s `src` setter schedules a
 * microtask that fires `load` (or `error` for a `"error:"`-prefixed src) instead of doing nothing.
 */

export type CanvasOp = { type: string; args: unknown[] };

declare global {
  interface HTMLCanvasElement {
    _ops: CanvasOp[];
  }
}

class MockContext2D {
  fillStyle = "";
  strokeStyle = "";
  lineWidth = 1;
  lineCap = "butt";
  font = "";
  textAlign = "start";
  textBaseline = "alphabetic";

  constructor(private canvas: HTMLCanvasElement) {}

  private record(type: string, args: unknown[]): void {
    this.canvas._ops.push({ type, args });
  }

  clearRect(...args: unknown[]): void {
    this.record("clearRect", args);
  }
  drawImage(image: HTMLImageElement, ...rest: unknown[]): void {
    // Record the loaded image's `src` rather than the element reference itself, so
    // `toDataURL()` can expose which source a draw actually used.
    this.record("drawImage", [image.src, ...rest]);
  }
  beginPath(): void {
    this.record("beginPath", []);
  }
  arc(...args: unknown[]): void {
    this.record("arc", args);
  }
  fill(): void {
    this.record("fill", [this.fillStyle]);
  }
  stroke(): void {
    this.record("stroke", [this.strokeStyle]);
  }
  fillText(...args: unknown[]): void {
    this.record("fillText", [...args, this.fillStyle, this.font]);
  }
}

HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, id: string) {
  if (id !== "2d") return null;
  this._ops ??= [];
  return new MockContext2D(this) as unknown as CanvasRenderingContext2D;
} as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.toDataURL = function (this: HTMLCanvasElement) {
  const ops = this._ops ?? [];
  const hasBadge = ops.some(op => op.type === "arc") && ops.some(op => op.type === "fill");
  const fillTextOp = ops.find(op => op.type === "fillText");
  const text = fillTextOp ? String(fillTextOp.args[0]) : "";
  const fillOp = ops.find(op => op.type === "fill");
  const color = fillOp ? String(fillOp.args[0]) : "";

  const strokeOps = ops.filter(op => op.type === "stroke");
  const hasRing = strokeOps.length > 0;
  // First stroke is always the track; a second (only drawn when progress > 0) is the arc.
  const trackColor = strokeOps.length > 0 ? String(strokeOps[0]!.args[0]) : "";
  const ringColor = strokeOps.length > 0 ? String(strokeOps[strokeOps.length - 1]!.args[0]) : "";
  const arcOps = ops.filter(op => op.type === "arc");
  const lastEndAngle = arcOps.length > 0 ? String(arcOps[arcOps.length - 1]!.args[4]) : "";
  // The badge circle's center — lets tests distinguish `position` corners (progress always
  // centers its ring, so this is only meaningful for badge's output).
  const firstArc = arcOps[0];
  const arcX = firstArc ? String(firstArc.args[0]) : "";
  const arcY = firstArc ? String(firstArc.args[1]) : "";
  // Which base image this draw actually used — otherwise two draws of the same value/progress
  // onto different base hrefs produce byte-identical mock output, masking a redraw that never
  // happened.
  const drawImageOp = ops.find(op => op.type === "drawImage");
  const src = drawImageOp ? String(drawImageOp.args[0]) : "";

  return (
    `data:mock;w=${this.width};h=${this.height};badge=${hasBadge};text=${text};color=${color};` +
    `ring=${hasRing};trackColor=${trackColor};ringColor=${ringColor};arcs=${arcOps.length};` +
    `endAngle=${lastEndAngle};arcX=${arcX};arcY=${arcY};src=${src}`
  );
};

const nativeSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src")!;

Object.defineProperty(HTMLImageElement.prototype, "src", {
  configurable: true,
  get(this: HTMLImageElement) {
    return nativeSrcDescriptor.get!.call(this);
  },
  set(this: HTMLImageElement, value: string) {
    nativeSrcDescriptor.set!.call(this, value);
    queueMicrotask(() => {
      if (value.startsWith("error:")) {
        this.dispatchEvent(new Event("error"));
        return;
      }
      Object.defineProperty(this, "naturalWidth", { value: 32, configurable: true });
      Object.defineProperty(this, "naturalHeight", { value: 32, configurable: true });
      this.dispatchEvent(new Event("load"));
    });
  },
});

/**
 * jsdom doesn't implement `matchMedia` at all. This mock tracks a `matches` flag per query string
 * and lets tests flip it with `setPrefersColorScheme`, dispatching `change` to every live listener
 * — `createFaviconScheme`'s only interaction with the platform.
 */
class MockMediaQueryList extends EventTarget implements MediaQueryList {
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null = null;
  constructor(public media: string) {
    super();
  }
  get matches(): boolean {
    return mediaQueryState.get(this.media) ?? false;
  }
  addListener(): void {}
  removeListener(): void {}
}

const mediaQueryState = new Map<string, boolean>();
const liveMediaQueries: MockMediaQueryList[] = [];

/**
 * Installs the `window.matchMedia` mock. Exported so `scheme.test.ts` can re-run it in a
 * `beforeEach` — this file's other mocks are simple prototype overrides that no other package
 * touches, but `window.matchMedia` is also assigned by other packages' test suites (`media`,
 * `a11y`) sharing this same global in the monorepo's non-isolated (`isolate: false`) test run;
 * re-installing per-test guards against whichever of them runs last in the shared worker.
 */
export function installMatchMediaMock(): void {
  window.matchMedia = ((query: string) => {
    const mql = new MockMediaQueryList(query);
    liveMediaQueries.push(mql);
    return mql;
  }) as typeof window.matchMedia;
}

installMatchMediaMock();

/** Test helper: simulate an OS/browser `prefers-color-scheme` change. */
export function setPrefersColorScheme(scheme: "light" | "dark"): void {
  const query = "(prefers-color-scheme: dark)";
  mediaQueryState.set(query, scheme === "dark");
  for (const mql of liveMediaQueries) {
    if (mql.media !== query) continue;
    mql.dispatchEvent(Object.assign(new Event("change"), { matches: mql.matches, media: query }));
  }
}
