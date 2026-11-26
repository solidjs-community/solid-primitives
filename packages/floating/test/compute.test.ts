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
      mockRect(document.body, rect(0, -100, 1000, 2000));
      document.body.style.position = "relative";
      global(floating, "offsetParent", document.body);
      expect(computePosition(reference, floating).y).toBe(440);
      document.body.style.position = "";
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

  describe("boundaries", () => {
    test("uses visualViewport when available", () => {
      const { reference, floating } = setup(rect(280, 300, 10, 20));
      global(window, "visualViewport", { offsetLeft: 10, offsetTop: 20, width: 300, height: 400 });
      const r = computePosition(reference, floating, { placement: "bottom", shift: true });
      // viewport right edge is 310 -> floating x max 250
      expect(r.x).toBe(250);
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
