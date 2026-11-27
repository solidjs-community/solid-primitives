import { afterEach, describe, expect, test, vi } from "vitest";
import {
  computePosition,
  computePositionFromRects,
  getOppositePlacement,
  type Placement,
} from "../src/index.js";
import { defineGlobal, mockRect, rect } from "./helpers.js";

const ref = rect(400, 300, 100, 40);
const fl = { width: 60, height: 30 };
const clip = rect(0, 0, 1000, 800);

const at = (placement: Placement, extra = {}, r = ref, size = fl, c = clip) =>
  computePositionFromRects(r, size, c, { placement, ...extra });

describe("placements", () => {
  const expected: [Placement, number, number][] = [
    ["top", 420, 270],
    ["top-start", 400, 270],
    ["top-end", 440, 270],
    ["bottom", 420, 340],
    ["bottom-start", 400, 340],
    ["bottom-end", 440, 340],
    ["left", 340, 305],
    ["left-start", 340, 300],
    ["left-end", 340, 310],
    ["right", 500, 305],
    ["right-start", 500, 300],
    ["right-end", 500, 310],
  ];
  test.each(expected)("%s", (placement, x, y) => {
    const r = at(placement);
    expect([r.x, r.y, r.placement]).toEqual([x, y, placement]);
    expect(r.middlewareData.flipped).toBe(false);
    expect(r.middlewareData.shifted).toBe(false);
  });

  test("defaults to bottom / absolute", () => {
    const r = computePositionFromRects(ref, fl, clip);
    expect([r.x, r.y, r.placement, r.strategy]).toEqual([420, 340, "bottom", "absolute"]);
  });

  test("getOppositePlacement keeps alignment", () => {
    expect(getOppositePlacement("top-start")).toBe("bottom-start");
    expect(getOppositePlacement("left")).toBe("right");
    expect(getOppositePlacement("right-end")).toBe("left-end");
  });
});

describe("rtl", () => {
  test.each<[Placement, number]>([
    ["top-start", 440],
    ["top-end", 400],
    ["bottom-start", 440],
    ["bottom-end", 400],
    ["bottom", 420],
  ])("%s aligns to the mirrored edge", (placement, x) => {
    expect(at(placement, { rtl: true }).x).toBe(x);
  });

  test("left/right alignment is unaffected", () => {
    expect(at("left-start", { rtl: true }).y).toBe(300);
    expect(at("right-end", { rtl: true }).y).toBe(310);
  });

  test("cross-axis offset mirrors on top/bottom only", () => {
    expect(at("bottom-start", { offset: { crossAxis: 5 } }).x).toBe(405);
    expect(at("bottom-start", { offset: { crossAxis: 5 }, rtl: true }).x).toBe(435);
    expect(at("right-start", { offset: { crossAxis: 5 }, rtl: true }).y).toBe(305);
  });
});

describe("offset", () => {
  test("number is main axis", () => {
    expect(at("bottom", { offset: 10 }).y).toBe(350);
    expect(at("top", { offset: 10 }).y).toBe(260);
    expect(at("left", { offset: 10 }).x).toBe(330);
    expect(at("right", { offset: 10 }).x).toBe(510);
  });

  test("crossAxis moves inward for end alignment", () => {
    expect(at("bottom-end", { offset: { crossAxis: 5 } }).x).toBe(435);
    expect(at("bottom", { offset: { crossAxis: 5 } }).x).toBe(425);
    expect(at("right-start", { offset: { mainAxis: 2, crossAxis: 5 } })).toMatchObject({
      x: 502,
      y: 305,
    });
    expect(at("right-end", { offset: { crossAxis: 5 } }).y).toBe(305);
  });
});

describe("flip", () => {
  test("is opt-in", () => {
    const r = at("bottom", {}, rect(400, 770, 100, 20));
    expect(r.placement).toBe("bottom");
  });

  test("flips to the opposite side when the preferred one overflows", () => {
    const r = at("bottom-start", { flip: true }, rect(400, 770, 100, 20));
    expect([r.x, r.y, r.placement, r.middlewareData.flipped]).toEqual([
      400,
      740,
      "top-start",
      true,
    ]);
  });

  test("flips on every side", () => {
    expect(at("top", { flip: true }, rect(400, 10, 100, 20)).placement).toBe("bottom");
    expect(at("left", { flip: true }, rect(10, 300, 20, 40)).placement).toBe("right");
    expect(at("right", { flip: true }, rect(970, 300, 20, 40)).placement).toBe("left");
  });

  test("stays put when it fits", () => {
    const r = at("bottom", { flip: true });
    expect(r.middlewareData.flipped).toBe(false);
  });

  test("flip padding makes a near-miss overflow", () => {
    const near = rect(400, 730, 100, 20); // floating bottom edge at 780
    expect(at("bottom", { flip: true }, near).placement).toBe("bottom");
    expect(at("bottom", { flip: { padding: 30 } }, near).placement).toBe("top");
  });

  test("offset counts towards overflow", () => {
    const near = rect(400, 740, 100, 20); // 760 + 30 = 790 fits, +20 offset overflows
    expect(at("bottom", { flip: true }, near).placement).toBe("bottom");
    expect(at("bottom", { flip: true, offset: 20 }, near).placement).toBe("top");
  });

  test("tries fallbackPlacements in order and takes the first that fits", () => {
    // no room below, room above is also tight: only `right` fits
    const r = at(
      "bottom",
      { flip: { fallbackPlacements: ["top", "right"] } },
      rect(400, 10, 100, 785),
      fl,
      rect(0, 0, 1000, 800),
    );
    expect(r.placement).toBe("right");
    expect(r.middlewareData.flipped).toBe(true);
  });

  test("picks the least-overflowing placement when none fit", () => {
    const tiny = rect(0, 0, 1000, 50);
    const r = at("top", { flip: true }, rect(400, 10, 100, 20), fl, tiny); // top: 20, bottom: 10
    expect(r.placement).toBe("bottom");
    const keep = at("bottom", { flip: true }, rect(400, 10, 100, 20), fl, tiny);
    expect(keep.placement).toBe("bottom");
    expect(keep.middlewareData.flipped).toBe(false);
  });

  test("empty fallbackPlacements disables flipping", () => {
    expect(
      at("bottom", { flip: { fallbackPlacements: [] } }, rect(400, 770, 100, 20)).placement,
    ).toBe("bottom");
  });

  test("works with rtl alignment", () => {
    const r = at("bottom-start", { flip: true, rtl: true }, rect(400, 770, 100, 20));
    expect([r.placement, r.x]).toEqual(["top-start", 440]);
  });
});

describe("shift", () => {
  test("is opt-in", () => {
    expect(at("bottom", {}, rect(980, 300, 10, 40)).x).toBe(955);
  });

  test("keeps the element inside the right and left edges", () => {
    const right = at("bottom", { shift: true }, rect(980, 300, 10, 40));
    expect([right.x, right.middlewareData.shifted, right.middlewareData.shift]).toEqual([
      940,
      true,
      { x: -15, y: 0 },
    ]);
    const left = at("bottom", { shift: true }, rect(0, 300, 10, 40));
    expect([left.x, left.middlewareData.shift.x]).toEqual([0, 25]);
  });

  test("keeps the element inside the top and bottom edges for side placements", () => {
    expect(at("right", { shift: true }, rect(400, 790, 10, 10)).y).toBe(770);
    expect(at("left", { shift: true }, rect(400, 0, 10, 10)).y).toBe(0);
  });

  test("padding", () => {
    expect(at("bottom", { shift: { padding: 8 } }, rect(980, 300, 10, 40)).x).toBe(932);
    expect(at("bottom", { shift: { padding: { left: 20 } } }, rect(0, 300, 10, 40)).x).toBe(20);
  });

  test("does nothing when it already fits", () => {
    const r = at("bottom", { shift: true });
    expect(r.middlewareData.shifted).toBe(false);
    expect(r.middlewareData.shift).toEqual({ x: 0, y: 0 });
  });

  test("does not move the main axis by default; mainAxis lets it overlap the reference", () => {
    const edge = rect(400, 790, 100, 10); // bottom: y = 800, 30 tall
    expect(at("bottom", { shift: true }, edge).y).toBe(800);
    expect(at("bottom", { shift: { mainAxis: true } }, edge).y).toBe(770);
  });

  test("crossAxis: false", () => {
    expect(at("bottom", { shift: { crossAxis: false } }, rect(980, 300, 10, 40)).x).toBe(955);
  });

  test("without a limiter the element detaches from an off-screen reference", () => {
    expect(at("bottom", { shift: true }, rect(1100, 300, 10, 40)).x).toBe(940);
    expect(at("bottom", { shift: true }, rect(-50, 300, 10, 40)).x).toBe(0);
  });

  test("limit keeps the element attached to the reference", () => {
    expect(at("bottom", { shift: { limit: true } }, rect(1100, 300, 10, 40)).x).toBe(1040);
    expect(at("bottom", { shift: { limit: true } }, rect(-50, 300, 10, 40)).x).toBe(-40);
  });

  test("limit offset keeps some overlap", () => {
    const r = at("bottom", { shift: { limit: { offset: 4 } } }, rect(1100, 300, 10, 40));
    expect(r.x).toBe(1044);
  });

  test("limit does not undo an unshifted position", () => {
    expect(at("bottom", { shift: { limit: true } }).x).toBe(420);
  });

  test("element larger than the boundary pins to the start edge", () => {
    expect(at("bottom", { shift: true }, ref, { width: 2000, height: 30 }).x).toBe(0);
  });

  test("works after a flip", () => {
    const r = at("bottom", { flip: true, shift: true }, rect(980, 770, 10, 20));
    expect([r.placement, r.x, r.y]).toEqual(["top", 940, 740]);
  });
});

describe("size / available space", () => {
  test("available height below and above", () => {
    expect(at("bottom").middlewareData.availableHeight).toBe(800 - 340);
    expect(at("top").middlewareData.availableHeight).toBe(300);
  });

  test("available width on the side placements", () => {
    expect(at("right").middlewareData.availableWidth).toBe(1000 - 500);
    expect(at("left").middlewareData.availableWidth).toBe(400);
  });

  test("grows towards the alignment side", () => {
    // bottom-start: floating starts at ref.x, so it can grow to the right
    expect(at("bottom-start").middlewareData.availableWidth).toBe(600);
    // bottom-end: its right edge is at ref right, so it can grow to the left
    expect(at("bottom-end").middlewareData.availableWidth).toBe(500);
    expect(at("bottom-end", { rtl: true }).middlewareData.availableWidth).toBe(600);
    // right-end: bottom aligned, grows up
    expect(at("right-end").middlewareData.availableHeight).toBe(340);
    expect(at("right-start").middlewareData.availableHeight).toBe(500);
  });

  test("padding is subtracted", () => {
    expect(at("bottom", { size: { padding: 10 } }).middlewareData.availableHeight).toBe(450);
    expect(at("bottom", { size: { padding: { bottom: 20 } } }).middlewareData.availableHeight).toBe(
      440,
    );
  });

  test("never negative", () => {
    expect(at("bottom", {}, rect(400, 900, 100, 10)).middlewareData.availableHeight).toBe(0);
  });

  test("measured after flip and shift", () => {
    const r = at("bottom", { flip: true }, rect(400, 770, 100, 20));
    expect(r.middlewareData.availableHeight).toBe(770);
    const s = at("bottom", { shift: true }, rect(980, 300, 10, 40));
    expect(s.middlewareData.availableWidth).toBe(60);
  });
});

describe("transform origin", () => {
  test("points at the reference center", () => {
    expect(at("bottom").middlewareData.transformOrigin).toBe("30px 0px");
    expect(at("top").middlewareData.transformOrigin).toBe("30px 30px");
    expect(at("right").middlewareData.transformOrigin).toBe("0px 15px");
    expect(at("left").middlewareData.transformOrigin).toBe("60px 15px");
  });

  test("is clamped to the floating element", () => {
    expect(at("bottom-start", {}, rect(400, 300, 300, 40)).middlewareData.transformOrigin).toBe(
      "60px 0px",
    );
    expect(at("bottom-end", {}, rect(400, 300, 300, 40)).middlewareData.transformOrigin).toBe(
      "0px 0px",
    );
  });
});

describe("arrow", () => {
  const arrow = { width: 10, height: 10 };
  const solve = (placement: Placement, extra = {}, padding?: number, r = ref) =>
    computePositionFromRects(
      r,
      fl,
      clip,
      { placement, ...extra },
      { arrow: { ...arrow, padding } },
    );

  test("is absent without an arrow", () => {
    expect(at("bottom").middlewareData.arrow).toBeUndefined();
  });

  test("points at the reference center", () => {
    expect(solve("bottom").middlewareData.arrow).toEqual({ x: 25, centerOffset: 0 });
    expect(solve("bottom-start").middlewareData.arrow).toEqual({ x: 45, centerOffset: 0 });
    expect(solve("right-start").middlewareData.arrow).toEqual({ y: 15, centerOffset: 0 });
  });

  test("clamps to padding and reports the center offset", () => {
    // bottom-end: floating x=440, ref center 450 -> desired 5; padding 8 -> 8
    expect(solve("bottom-end", {}, 8).middlewareData.arrow).toEqual({ x: 8, centerOffset: -3 });
    // bottom-start on a wide reference: desired is past the far edge
    const wide = solve("bottom-start", {}, 4, rect(400, 300, 300, 40)).middlewareData.arrow!;
    expect(wide.x).toBe(46);
    expect(wide.centerOffset).toBe(150 - 5 - 46);
  });

  test("follows the shifted position", () => {
    const r = solve("bottom", { shift: true }, 0, rect(980, 300, 10, 40));
    // floating x = 940; reference center 985 -> 985 - 940 - 5 = 40
    expect(r.middlewareData.arrow).toEqual({ x: 40, centerOffset: 0 });
  });

  test("moves the transform origin to the arrow", () => {
    expect(solve("bottom-start").middlewareData.transformOrigin).toBe("50px 0px");
  });

  test("padding larger than the free space centers the arrow instead of pinning it to the start", () => {
    // 20px box, 10px arrow, 15px padding: floating x = 440, desired = 450 - 440 - 5 = 5
    const r = computePositionFromRects(
      ref,
      { width: 20, height: 30 },
      clip,
      { placement: "bottom" },
      { arrow: { ...arrow, padding: 15 } },
    );
    expect(r.middlewareData.arrow).toEqual({ x: 5, centerOffset: 0 });
    expect(r.middlewareData.transformOrigin).toBe("10px 0px");
  });

  test("padding is capped at half the free space and the transform origin follows the clamped arrow", () => {
    // 40px box, 10px arrow, free space 30, padding 20 -> capped to 15. bottom-end: x = 440 - 20 + ...
    const r = computePositionFromRects(
      rect(400, 300, 100, 40),
      { width: 40, height: 30 },
      clip,
      { placement: "bottom-end" },
      { arrow: { ...arrow, padding: 20 } },
    );
    // floating x = 450 + 50 - 40 = 460 -> wait: end aligns right edges: 400 + 100 - 40 = 460; desired = 450 - 460 - 5 = -15
    expect(r.middlewareData.arrow).toEqual({ x: 15, centerOffset: -30 });
    expect(r.middlewareData.transformOrigin).toBe("20px 0px");
  });

  test("an arrow wider than the floating element overflows from the start edge", () => {
    const r = computePositionFromRects(
      ref,
      { width: 8, height: 30 },
      clip,
      { placement: "bottom" },
      { arrow: { ...arrow, padding: 4 } },
    );
    expect(r.middlewareData.arrow!.x).toBe(0);
  });

  test("rtl", () => {
    // bottom-start in rtl: floating x = 440, center 450 -> 5
    expect(solve("bottom-start", { rtl: true }).middlewareData.arrow).toEqual({
      x: 5,
      centerOffset: 0,
    });
  });
});

describe("computePosition (DOM)", () => {
  const cleanups: (() => void)[] = [];
  afterEach(() => {
    cleanups.splice(0).forEach(fn => fn());
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });
  const global = (target: object, key: string, value: unknown) =>
    cleanups.push(defineGlobal(target, key, value));

  const setup = (refRect = ref, flRect = rect(0, 0, 60, 30)) => {
    const reference = mockRect(document.createElement("button"), refRect);
    const floating = mockRect(document.createElement("div"), flRect);
    document.body.append(reference, floating);
    global(window, "innerWidth", 1000);
    global(window, "innerHeight", 800);
    return { reference, floating };
  };

  test("measures elements and defaults to the viewport", () => {
    const { reference, floating } = setup(rect(400, 770, 100, 20));
    const r = computePosition(reference, floating, { placement: "bottom", flip: true });
    expect([r.x, r.y, r.placement]).toEqual([420, 740, "top"]);
  });

  test("accepts a virtual reference", () => {
    const { floating } = setup();
    const r = computePosition(
      { getBoundingClientRect: () => ({ x: 100, y: 100, width: 0, height: 0 }) } as never,
      floating,
      { placement: "bottom" },
    );
    expect([r.x, r.y]).toEqual([70, 100]);
  });

  test("virtual references may use left/top", () => {
    const { floating } = setup();
    const r = computePosition(
      { getBoundingClientRect: () => ({ left: 100, top: 100, width: 0, height: 0 }) },
      floating,
      { placement: "bottom" },
    );
    expect([r.x, r.y]).toEqual([70, 100]);
  });

  describe("strategy", () => {
    test("fixed uses viewport coordinates", () => {
      const { reference, floating } = setup();
      global(window, "scrollY", 200);
      global(window, "scrollX", 50);
      const r = computePosition(reference, floating, { strategy: "fixed" });
      expect([r.x, r.y, r.strategy]).toEqual([420, 340, "fixed"]);
    });

    test("absolute adds the document scroll when there is no positioned ancestor", () => {
      const { reference, floating } = setup();
      global(window, "scrollY", 200);
      global(window, "scrollX", 50);
      const r = computePosition(reference, floating, { strategy: "absolute" });
      expect([r.x, r.y]).toEqual([470, 540]);
    });

    test("absolute is relative to the offset parent", () => {
      const { reference, floating } = setup();
      const parent = mockRect(document.createElement("div"), rect(50, 60, 500, 500));
      global(parent, "clientLeft", 2);
      global(parent, "clientTop", 3);
      global(parent, "scrollLeft", 10);
      global(parent, "scrollTop", 20);
      global(floating, "offsetParent", parent);
      const r = computePosition(reference, floating, { strategy: "absolute" });
      // origin = (50 + 2 - 10, 60 + 3 - 20)
      expect([r.x, r.y]).toEqual([420 - 42, 340 - 43]);
    });

    test("a static body is treated as the document", () => {
      const { reference, floating } = setup();
      global(floating, "offsetParent", document.body);
      global(window, "scrollY", 100);
      expect(computePosition(reference, floating).y).toBe(440);
    });

    test("a positioned body is the offset parent", () => {
      const { reference, floating } = setup();
      // registered before the assertion so a failure cannot leak the overrides
      global(
        document.body,
        "getBoundingClientRect",
        mockRect(document.createElement("i"), rect(0, -100, 1000, 2000)).getBoundingClientRect,
      );
      cleanups.push(() => {
        document.body.style.position = "";
      });
      document.body.style.position = "relative";
      global(floating, "offsetParent", document.body);
      expect(computePosition(reference, floating).y).toBe(440);
    });

    test("overrides of a previous test do not leak (probe)", () => {
      expect(Object.hasOwn(document.body, "getBoundingClientRect")).toBe(false);
      expect(document.body.style.position).toBe("");
      expect(document.body.getBoundingClientRect().y).toBe(0);
    });

    test("fixed and absolute agree on size and flip results", () => {
      const { reference, floating } = setup(rect(400, 770, 100, 20));
      global(window, "scrollY", 300);
      const a = computePosition(reference, floating, { flip: true, strategy: "absolute" });
      const f = computePosition(reference, floating, { flip: true, strategy: "fixed" });
      expect(a.placement).toBe(f.placement);
      expect(a.y - f.y).toBe(300);
    });
  });

  describe("containing block and scale", () => {
    /** Mocks getComputedStyle per element; unlisted elements get empty styles. */
    const mockStyles = (styles: Map<Element, Record<string, string>>) => {
      const real = window.getComputedStyle.bind(window);
      vi.spyOn(window, "getComputedStyle").mockImplementation(((el: Element) => {
        const extra = styles.get(el);
        return extra ? ({ ...extra } as unknown as CSSStyleDeclaration) : real(el);
      }) as never);
    };
    const scaled = (el: HTMLElement, w: number, h: number) => {
      global(el, "offsetWidth", w);
      global(el, "offsetHeight", h);
    };
    const bottom = (reference: Element, floating: HTMLElement, strategy: "fixed" | "absolute") =>
      computePosition(reference, floating, { placement: "bottom", strategy });

    test("fixed: a transformed ancestor is the containing block", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20), rect(0, 0, 60, 30));
      const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      ancestor.append(floating);
      document.body.append(ancestor);
      mockStyles(new Map([[ancestor, { transform: "translateZ(0)" }]]));
      const r = bottom(reference, floating, "fixed");
      // viewport position (190, 120) minus the ancestor origin (100, 50)
      expect([r.x, r.y]).toEqual([90, 70]);
    });

    test.each([
      ["perspective", { perspective: "100px" }],
      ["filter", { filter: "blur(1px)" }],
      ["backdrop-filter", { backdropFilter: "blur(1px)" }],
      ["will-change transform", { willChange: "opacity, transform" }],
      ["will-change translate", { willChange: "translate" }],
      ["will-change rotate", { willChange: "rotate" }],
      ["will-change scale", { willChange: "scale" }],
      ["translate", { translate: "10px 0px" }],
      ["rotate", { rotate: "10deg" }],
      ["scale", { scale: "1.5" }],
      ["contain paint", { contain: "paint" }],
      ["contain layout", { contain: "layout" }],
      ["contain strict", { contain: "strict" }],
      ["contain content", { contain: "content" }],
    ])("fixed: %s creates a containing block", (_name, style) => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      ancestor.append(floating);
      document.body.append(ancestor);
      mockStyles(new Map([[ancestor, { transform: "none", ...style }]]));
      const r = bottom(reference, floating, "fixed");
      expect([r.x, r.y]).toEqual([90, 70]);
    });

    test.each(["inline-size", "size"])(
      "fixed: container-type %s alone does not create a containing block",
      containerType => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
        ancestor.append(floating);
        document.body.append(ancestor);
        mockStyles(new Map([[ancestor, { transform: "none", containerType }]]));
        expect(bottom(reference, floating, "fixed").x).toBe(190);
      },
    );

    test("fixed: scroll offsets of the containing block are subtracted", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      global(ancestor, "scrollTop", 40);
      global(ancestor, "scrollLeft", 10);
      ancestor.append(floating);
      document.body.append(ancestor);
      mockStyles(new Map([[ancestor, { transform: "translateZ(0)" }]]));
      const r = bottom(reference, floating, "fixed");
      // target (190, 120); origin (100 - 10, 50 - 40)
      expect([r.x, r.y]).toEqual([100, 110]);
    });

    test("fixed: a transformed documentElement does not subtract viewport scroll", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const html = document.documentElement;
      // viewport scrolling is not box scrolling: the box rect already moved with it
      global(html, "scrollTop", 300);
      global(
        html,
        "getBoundingClientRect",
        mockRect(document.createElement("i"), rect(0, -300, 1000, 3000)).getBoundingClientRect,
      );
      mockStyles(new Map([[html, { transform: "translateZ(0)" }]]));
      const r = bottom(reference, floating, "fixed");
      expect([r.x, r.y]).toEqual([190, 120 + 300]);
    });

    test("fixed: unrelated styles do not create a containing block", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      ancestor.append(floating);
      document.body.append(ancestor);
      mockStyles(
        new Map([
          [ancestor, { transform: "none", filter: "none", willChange: "opacity", contain: "none" }],
        ]),
      );
      const r = bottom(reference, floating, "fixed");
      expect([r.x, r.y]).toEqual([190, 120]);
    });

    test("fixed: border of the containing block is accounted for", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      global(ancestor, "clientLeft", 4);
      global(ancestor, "clientTop", 6);
      ancestor.append(floating);
      document.body.append(ancestor);
      mockStyles(new Map([[ancestor, { transform: "scale(1)" }]]));
      const r = bottom(reference, floating, "fixed");
      expect([r.x, r.y]).toEqual([190 - 104, 120 - 56]);
    });

    test("fixed: the nearest transformed ancestor wins when nested", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const outer = mockRect(document.createElement("div"), rect(10, 10, 800, 800));
      const inner = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      const plain = mockRect(document.createElement("div"), rect(300, 300, 50, 50));
      plain.append(floating);
      inner.append(plain);
      outer.append(inner);
      document.body.append(outer);
      mockStyles(
        new Map([
          [outer, { transform: "rotate(0deg)" }],
          [inner, { filter: "blur(2px)" }],
        ]),
      );
      const r = bottom(reference, floating, "fixed");
      expect([r.x, r.y]).toEqual([90, 70]);
    });

    test("fixed: ignores a transformed element that is not an ancestor", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const sibling = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      document.body.append(sibling);
      mockStyles(new Map([[sibling, { transform: "translateZ(0)" }]]));
      expect(bottom(reference, floating, "fixed").x).toBe(190);
    });

    test("fixed: follows shadow hosts and slots", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const host = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      const shadow = host.attachShadow({ mode: "open" });
      const wrapper = document.createElement("div");
      shadow.append(wrapper);
      wrapper.append(floating);
      document.body.append(host);
      mockStyles(new Map([[host, { transform: "translateZ(0)" }]]));
      expect([bottom(reference, floating, "fixed").x]).toEqual([90]);
    });

    test("fixed: a throwing getComputedStyle falls back to the viewport", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const ancestor = document.createElement("div");
      ancestor.append(floating);
      document.body.append(ancestor);
      vi.spyOn(window, "getComputedStyle").mockImplementation(() => {
        throw new Error("boom");
      });
      // direction lookup is skipped by passing rtl
      const r = computePosition(reference, floating, {
        placement: "bottom",
        strategy: "fixed",
        rtl: false,
      });
      expect(r.x).toBe(190);
    });

    test("fixed: scale of the containing block is applied", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
      scaled(ancestor, 250, 250);
      ancestor.append(floating);
      document.body.append(ancestor);
      mockStyles(new Map([[ancestor, { transform: "scale(2)" }]]));
      const r = bottom(reference, floating, "fixed");
      expect([r.x, r.y]).toEqual([(190 - 100) / 2, (120 - 50) / 2]);
    });

    test("absolute: uniform scale converts to local CSS px", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(0, 0, 400, 400));
      scaled(parent, 200, 200);
      global(floating, "offsetParent", parent);
      const r = computePosition(reference, floating, {
        placement: "bottom",
        strategy: "absolute",
        size: { padding: 0 },
      });
      // unscaled solver: (190, 120)
      expect([r.x, r.y]).toEqual([95, 60]);
      expect(r.middlewareData.availableWidth).toBe(
        computePosition(reference, floating, { placement: "bottom", strategy: "fixed" })
          .middlewareData.availableWidth / 2,
      );
    });

    test("absolute: non-uniform scale", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(0, 0, 400, 400));
      scaled(parent, 200, 100);
      global(floating, "offsetParent", parent);
      const r = bottom(reference, floating, "absolute");
      expect([r.x, r.y]).toEqual([95, 30]);
    });

    test("absolute: a scaled parent with an offset keeps the same viewport place", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(20, 10, 400, 400));
      scaled(parent, 200, 200);
      global(floating, "offsetParent", parent);
      const r = bottom(reference, floating, "absolute");
      expect([20 + r.x * 2, 10 + r.y * 2]).toEqual([190, 120]);
    });

    test("absolute: scale 1 is unchanged", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(20, 10, 400, 400));
      scaled(parent, 400, 400);
      global(floating, "offsetParent", parent);
      const r = bottom(reference, floating, "absolute");
      expect([r.x, r.y]).toEqual([170, 110]);
    });

    test("absolute: fractional layout rounding is not mistaken for a scale", () => {
      // reference at 410 -> floating x = 400
      const { reference, floating } = setup(rect(410, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(0, 0, 100.25, 100.25));
      scaled(parent, 100, 100);
      global(floating, "offsetParent", parent);
      const r = bottom(reference, floating, "absolute");
      expect([r.x, r.y]).toEqual([400, 120]);
    });

    test.each([
      ["2", 400, 200],
      ["1.5", 300, 200],
      ["0.5", 100, 200],
      ["1.05 on a large parent", 1050, 1000],
    ])("absolute: genuinely scaled parent (%s) still converts", (_n, measured, css) => {
      const { reference, floating } = setup(rect(410, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(0, 0, measured, measured));
      scaled(parent, css, css);
      global(floating, "offsetParent", parent);
      const k = measured / css;
      const r = bottom(reference, floating, "absolute");
      expect(r.x).toBeCloseTo(400 / k, 6);
      expect(r.y).toBeCloseTo(120 / k, 6);
    });

    test("absolute: a transformed static body is the containing block", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      global(
        document.body,
        "getBoundingClientRect",
        mockRect(document.createElement("i"), rect(100, 0, 1000, 2000)).getBoundingClientRect,
      );
      global(floating, "offsetParent", document.body);
      mockStyles(new Map([[document.body, { position: "static", transform: "translateZ(0)" }]]));
      const r = bottom(reference, floating, "absolute");
      expect([r.x, r.y]).toEqual([90, 120]);
    });

    test("absolute: a static body with a will-change containing block is respected too", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      global(
        document.body,
        "getBoundingClientRect",
        mockRect(document.createElement("i"), rect(100, 0, 1000, 2000)).getBoundingClientRect,
      );
      global(floating, "offsetParent", document.body);
      mockStyles(new Map([[document.body, { position: "static", willChange: "translate" }]]));
      expect(bottom(reference, floating, "absolute").x).toBe(90);
    });

    test("absolute: a transformed documentElement is the containing block when body is static", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const html = document.documentElement;
      global(
        html,
        "getBoundingClientRect",
        mockRect(document.createElement("i"), rect(100, 0, 1000, 2000)).getBoundingClientRect,
      );
      global(floating, "offsetParent", document.body);
      mockStyles(
        new Map([
          [document.body, { position: "static" }],
          [html, { transform: "translateZ(0)" }],
        ]),
      );
      expect(bottom(reference, floating, "absolute").x).toBe(90);
    });

    describe("top layer", () => {
      const topLayer = (floating: HTMLElement, matching: string[], throwing: string[] = []) => {
        const real = floating.matches.bind(floating);
        floating.matches = ((selector: string) => {
          if (throwing.includes(selector)) throw new SyntaxError(`unknown pseudo ${selector}`);
          return matching.includes(selector) || (!selector.startsWith(":") && real(selector));
        }) as never;
      };
      const transformedAncestor = (floating: HTMLElement) => {
        const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
        ancestor.append(floating);
        document.body.append(ancestor);
        mockStyles(new Map([[ancestor, { transform: "translateZ(0)" }]]));
      };

      test.each([":popover-open", ":modal", ":fullscreen"])(
        "fixed: %s ignores a transformed ancestor",
        selector => {
          const { reference, floating } = setup(rect(200, 100, 40, 20));
          transformedAncestor(floating);
          topLayer(floating, [selector]);
          expect(bottom(reference, floating, "fixed")).toMatchObject({ x: 190, y: 120 });
        },
      );

      test("fixed: a browser that throws on one pseudo-class still detects the others", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        transformedAncestor(floating);
        topLayer(floating, [":modal"], [":popover-open", ":fullscreen"]);
        expect(bottom(reference, floating, "fixed")).toMatchObject({ x: 190, y: 120 });
      });

      test("fixed: a browser that throws on every pseudo-class falls back to the ancestor walk", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        transformedAncestor(floating);
        topLayer(floating, [], [":popover-open", ":modal", ":fullscreen"]);
        expect(bottom(reference, floating, "fixed")).toMatchObject({ x: 90, y: 70 });
      });

      test("absolute: a top-layer element measures from the document, not a transformed html", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const html = document.documentElement;
        global(window, "scrollX", 0);
        global(window, "scrollY", 300);
        global(
          html,
          "getBoundingClientRect",
          mockRect(document.createElement("i"), rect(11, -293, 1000, 3000)).getBoundingClientRect,
        );
        mockStyles(new Map([[html, { transform: "translate(11px, 7px)" }]]));
        topLayer(floating, [":popover-open"]);
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190, 120 + 300]);
      });
    });

    describe("positioned documentElement with a static body", () => {
      const withHtml = (
        htmlRect: ReturnType<typeof rect>,
        style: Record<string, string>,
        extra: { clientLeft?: number; clientTop?: number } = {},
      ) => {
        const html = document.documentElement;
        global(
          html,
          "getBoundingClientRect",
          mockRect(document.createElement("i"), htmlRect).getBoundingClientRect,
        );
        global(html, "clientLeft", extra.clientLeft ?? 0);
        global(html, "clientTop", extra.clientTop ?? 0);
        mockStyles(
          new Map<Element, Record<string, string>>([
            [document.body, { position: "static" }],
            [html, style],
          ]),
        );
      };

      test("html relative with margin: origin is the html box, not the document", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        global(floating, "offsetParent", document.body);
        withHtml(rect(13, 13, 1000, 2000), { position: "relative" });
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190 - 13, 120 - 13]);
      });

      test("html relative with border: the padding box is the origin", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        global(floating, "offsetParent", document.body);
        withHtml(rect(3, 3, 1000, 2000), { position: "relative" }, { clientLeft: 6, clientTop: 6 });
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190 - 9, 120 - 9]);
      });

      test("html relative with left/top offsets and a scrolled page", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        global(floating, "offsetParent", document.body);
        // scrollY 300: html border box is at (17, 9 - 300)
        withHtml(rect(17, -291, 1000, 3000), { position: "absolute" });
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190 - 17, 120 + 291]);
      });

      test("html with a static position and a margin keeps the document origin", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        global(floating, "offsetParent", document.body);
        global(window, "scrollX", 0);
        global(window, "scrollY", 0);
        withHtml(rect(13, 13, 1000, 2000), { position: "static" });
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190, 120]);
      });
    });

    describe("root element exceptions and extra containing-block triggers", () => {
      const rootFixed = (html: Record<string, string>, body: Record<string, string> = {}) => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const root = document.documentElement;
        // scrollY 300: the html rect has moved up with the page
        global(
          root,
          "getBoundingClientRect",
          mockRect(document.createElement("i"), rect(0, -300, 1000, 3000)).getBoundingClientRect,
        );
        mockStyles(
          new Map<Element, Record<string, string>>([
            [root, html],
            [document.body, body],
          ]),
        );
        return bottom(reference, floating, "fixed");
      };

      test.each([
        ["filter", { filter: "blur(1px)" }],
        ["backdrop-filter", { backdropFilter: "blur(1px)" }],
        ["will-change filter", { willChange: "filter" }],
        ["will-change backdrop-filter", { willChange: "opacity, backdrop-filter" }],
      ])("fixed: %s on the root element is not a containing block", (_n, style) => {
        expect(rootFixed(style)).toMatchObject({ x: 190, y: 120 });
      });

      test.each([
        ["filter", { filter: "blur(1px)" }],
        ["backdrop-filter", { backdropFilter: "blur(1px)" }],
        ["will-change filter", { willChange: "filter" }],
      ])("fixed: %s on body is a containing block", (_n, style) => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        global(
          document.body,
          "getBoundingClientRect",
          mockRect(document.createElement("i"), rect(20, -280, 1000, 3000)).getBoundingClientRect,
        );
        mockStyles(new Map([[document.body, style]]));
        expect(bottom(reference, floating, "fixed")).toMatchObject({ x: 170, y: 400 });
      });

      test.each([
        ["transform", { transform: "translateZ(0)" }],
        ["perspective", { perspective: "100px" }],
        ["contain paint", { contain: "paint" }],
        ["will-change transform", { willChange: "transform" }],
        ["offset-path path()", { offsetPath: 'path("M0 0 L10 10")' }],
        ["offset-path ray()", { offsetPath: "ray(45deg)" }],
        ["will-change contain", { willChange: "contain" }],
        ["will-change offset-path", { willChange: "offset-path" }],
        ["will-change offset", { willChange: "opacity, offset" }],
        ["will-change transform-style", { willChange: "transform-style" }],
        ["content-visibility auto", { contentVisibility: "auto" }],
        ["content-visibility hidden", { contentVisibility: "hidden" }],
        ["transform-style preserve-3d", { transformStyle: "preserve-3d" }],
      ])("fixed: %s on the root element is a containing block", (_n, style) => {
        expect(rootFixed(style)).toMatchObject({ x: 190, y: 120 + 300 });
      });

      test.each([
        ["offset-path none", { offsetPath: "none" }],
        ["content-visibility visible", { contentVisibility: "visible" }],
        ["transform-style flat", { transformStyle: "flat" }],
        ["will-change transform-origin", { willChange: "transform-origin" }],
        ["will-change perspective-origin", { willChange: "perspective-origin" }],
        ["will-change opacity transform-origin", { willChange: "opacity, transform-origin" }],
        ["-webkit-backdrop-filter", { webkitBackdropFilter: "blur(1px)" }],
        ["contain size style", { contain: "size style" }],
      ])("fixed: %s is not a containing block", (_n, style) => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const ancestor = mockRect(document.createElement("div"), rect(100, 50, 500, 500));
        ancestor.append(floating);
        document.body.append(ancestor);
        mockStyles(new Map([[ancestor, style]]));
        expect(bottom(reference, floating, "fixed")).toMatchObject({ x: 190, y: 120 });
      });
    });

    describe("shadow boundaries", () => {
      test("absolute: a slotted element finds the positioned wrapper in the shadow tree", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const host = document.createElement("div");
        const shadow = host.attachShadow({ mode: "open" });
        const wrapper = mockRect(document.createElement("div"), rect(100, 50, 400, 400));
        wrapper.append(document.createElement("slot"));
        shadow.append(wrapper);
        host.append(floating);
        document.body.append(host);
        // Chrome retargets offsetParent out of the shadow tree
        global(floating, "offsetParent", document.body);
        mockStyles(new Map([[wrapper, { position: "relative" }]]));
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190 - 100, 120 - 50]);
      });

      test("absolute: a slotted element finds a transformed wrapper (containing block, not positioned)", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const host = document.createElement("div");
        const shadow = host.attachShadow({ mode: "open" });
        const wrapper = mockRect(document.createElement("div"), rect(100, 50, 400, 400));
        wrapper.append(document.createElement("slot"));
        shadow.append(wrapper);
        host.append(floating);
        document.body.append(host);
        global(floating, "offsetParent", document.body);
        mockStyles(new Map([[wrapper, { transform: "translateZ(0)" }]]));
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([90, 70]);
      });

      test("absolute: an element inside a shadow tree uses the positioned host", () => {
        const { reference } = setup(rect(200, 100, 40, 20));
        const host = mockRect(document.createElement("div"), rect(60, 40, 400, 400));
        const shadow = host.attachShadow({ mode: "open" });
        const floating = mockRect(document.createElement("div"), rect(0, 0, 60, 30));
        shadow.append(floating);
        document.body.append(host);
        global(floating, "offsetParent", document.body);
        mockStyles(new Map([[host, { position: "relative" }]]));
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([190 - 60, 120 - 40]);
      });

      test("absolute: no shadow boundary keeps using offsetParent", () => {
        const { reference, floating } = setup(rect(200, 100, 40, 20));
        const parent = mockRect(document.createElement("div"), rect(100, 50, 400, 400));
        global(floating, "offsetParent", parent);
        const spy = vi.spyOn(window, "getComputedStyle");
        const r = bottom(reference, floating, "absolute");
        expect([r.x, r.y]).toEqual([90, 70]);
        expect(spy).not.toHaveBeenCalledWith(document.body);
      });
    });

    test("absolute: a zero offset size falls back to scale 1", () => {
      const { reference, floating } = setup(rect(200, 100, 40, 20));
      const parent = mockRect(document.createElement("div"), rect(0, 0, 400, 400));
      scaled(parent, 0, 0);
      global(floating, "offsetParent", parent);
      const r = bottom(reference, floating, "absolute");
      expect([r.x, r.y]).toEqual([190, 120]);
    });
  });

  describe("boundaries", () => {
    test("uses visualViewport when available", () => {
      const { reference, floating } = setup(rect(280, 300, 10, 20));
      global(window, "visualViewport", { offsetLeft: 10, offsetTop: 20, width: 300, height: 400 });
      const r = computePosition(reference, floating, { placement: "bottom", shift: true });
      // viewport right edge is 310 -> floating x max 250
      expect(r.x).toBe(250);
    });

    describe("RTL root with a scrollbar on the left", () => {
      const rtlRoot = (
        options: {
          rtl?: boolean;
          clientWidth?: number;
          vv?: { width: number; scale: number } | null;
        } = {},
      ) => {
        const { rtl = true, clientWidth = 985, vv = { width: 985, scale: 1 } } = options;
        const html = document.documentElement;
        global(html, "clientWidth", clientWidth);
        global(html, "clientHeight", 800);
        global(
          window,
          "visualViewport",
          vv ? { offsetLeft: 0, offsetTop: 0, height: 800, ...vv } : undefined,
        );
        const real = window.getComputedStyle.bind(window);
        vi.spyOn(window, "getComputedStyle").mockImplementation(((el: Element) =>
          el === html
            ? ({ direction: rtl ? "rtl" : "ltr" } as CSSStyleDeclaration)
            : real(el)) as never);
      };
      const shifted = () => {
        const { reference, floating } = setup(rect(5, 300, 10, 20));
        return () =>
          computePosition(reference, floating, { placement: "top", shift: true, rtl: true }).x;
      };

      test("the visible area starts after the scrollbar (visualViewport)", () => {
        const x = shifted();
        rtlRoot();
        // clip x range is [15, 1000]
        expect(x()).toBe(15);
      });

      test("the visible area starts after the scrollbar (no visualViewport)", () => {
        const x = shifted();
        rtlRoot({ vv: null });
        expect(x()).toBe(15);
      });

      test("LTR roots are unaffected", () => {
        const x = shifted();
        rtlRoot({ rtl: false });
        expect(x()).toBe(0);
      });

      test("a pinch-zoomed viewport is unaffected", () => {
        const x = shifted();
        rtlRoot({ vv: { width: 500, scale: 2 } });
        expect(x()).toBe(0);
      });

      test("an overlay scrollbar (innerWidth equals clientWidth) changes nothing", () => {
        const x = shifted();
        rtlRoot({ clientWidth: 1000, vv: { width: 1000, scale: 1 } });
        expect(x()).toBe(0);
      });
    });

    test("falls back to documentElement client size", () => {
      const { reference, floating } = setup(rect(280, 300, 10, 20));
      global(document.documentElement, "clientWidth", 300);
      global(document.documentElement, "clientHeight", 400);
      global(window, "visualViewport", undefined);
      const r = computePosition(reference, floating, { shift: true });
      expect(r.x).toBe(240);
    });

    test("boundary element is intersected with the viewport", () => {
      const { reference, floating } = setup(rect(400, 300, 20, 20));
      const boundary = mockRect(document.createElement("div"), rect(100, 100, 340, 400));
      const r = computePosition(reference, floating, { shift: true, boundary });
      // boundary right = 440 -> x max 380
      expect(r.x).toBe(380);
    });

    test("multiple boundary elements are intersected", () => {
      const { reference, floating } = setup(rect(400, 300, 20, 20));
      const a = mockRect(document.createElement("div"), rect(0, 0, 500, 500));
      const b = mockRect(document.createElement("div"), rect(0, 0, 440, 500));
      expect(computePosition(reference, floating, { shift: true, boundary: [a, b] }).x).toBe(380);
    });

    test("boundary rect", () => {
      const { reference, floating } = setup(rect(400, 300, 20, 20));
      expect(
        computePosition(reference, floating, { shift: true, boundary: rect(0, 0, 430, 800) }).x,
      ).toBe(370);
    });

    test("rootBoundary rect replaces the viewport", () => {
      const { reference, floating } = setup(rect(400, 300, 20, 20));
      const r = computePosition(reference, floating, {
        shift: true,
        rootBoundary: rect(0, 0, 410, 800),
      });
      expect(r.x).toBe(350);
    });

    test("rootBoundary: document spans the scrollable area", () => {
      const { reference, floating } = setup(rect(1500, 300, 20, 20));
      global(document.documentElement, "scrollWidth", 2000);
      global(document.documentElement, "scrollHeight", 3000);
      const doc = computePosition(reference, floating, { shift: true, rootBoundary: "document" });
      expect(doc.x).toBe(1500 + 10 - 30);
      const viewport = computePosition(reference, floating, { shift: true });
      expect(viewport.x).toBe(940);
    });

    test("disjoint boundaries leave no room", () => {
      const { reference, floating } = setup();
      const boundary = rect(2000, 2000, 10, 10);
      const r = computePosition(reference, floating, { boundary });
      expect(r.middlewareData.availableHeight).toBe(0);
    });
  });

  describe("rtl detection", () => {
    test("reads direction from the floating element when not given", () => {
      const { reference, floating } = setup();
      floating.style.direction = "rtl";
      expect(computePosition(reference, floating, { placement: "bottom-start" }).x).toBe(440);
      expect(
        computePosition(reference, floating, { placement: "bottom-start", rtl: false }).x,
      ).toBe(400);
    });
  });

  describe("arrow", () => {
    test("measures the arrow element", () => {
      const { reference, floating } = setup();
      const arrow = mockRect(document.createElement("div"), rect(0, 0, 10, 10));
      const r = computePosition(reference, floating, { arrow: { element: arrow } });
      expect(r.middlewareData.arrow).toEqual({ x: 25, centerOffset: 0 });
    });

    test("a missing arrow element is ignored", () => {
      const { reference, floating } = setup();
      const r = computePosition(reference, floating, { arrow: { element: null } });
      expect(r.middlewareData.arrow).toBeUndefined();
    });
  });

  describe("size.apply", () => {
    test("is called with the available space and triggers a re-solve when the size changed", () => {
      const { reference, floating } = setup(rect(400, 300, 100, 40));
      let size = { width: 60, height: 30 };
      mockRect(floating, () => ({ x: 0, y: 0, ...size }));
      const apply = vi.fn(({ availableHeight }: { availableHeight: number }) => {
        size = { width: 60, height: Math.min(size.height, 20) };
        expect(availableHeight).toBe(300);
      });
      const r = computePosition(reference, floating, { placement: "top", size: { apply } });
      expect(apply).toHaveBeenCalledTimes(1);
      expect(apply.mock.calls[0]![0]).toMatchObject({
        availableWidth: expect.any(Number),
        placement: "top",
        elements: { reference, floating },
      });
      // re-solved with the 20px tall element
      expect(r.y).toBe(280);
    });

    test("does not re-solve when nothing changed", () => {
      const { reference, floating } = setup();
      const spy = vi.spyOn(floating, "getBoundingClientRect");
      computePosition(reference, floating, { size: { apply: () => {} } });
      const withApply = spy.mock.calls.length;
      spy.mockClear();
      computePosition(reference, floating, {});
      // one solve, plus the before/after size measurements around `apply`
      expect(withApply).toBe(spy.mock.calls.length + 2);
    });
  });
});
