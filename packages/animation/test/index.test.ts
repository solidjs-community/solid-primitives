import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, createSignal, flush } from "solid-js";
import {
  makeAnimate,
  createAnimate,
  makeScrollAnimation,
  createScrollAnimation,
  makeViewAnimation,
  createViewAnimation,
  makeFlip,
  makeStagger,
  createStagger,
  makeAnimationGroup,
} from "../src/index.js";

// Helpers

function mockAnim() {
  return { cancel: vi.fn(), play: vi.fn(), pause: vi.fn(), finish: vi.fn(), reverse: vi.fn() } as unknown as Animation;
}

function makeEl() {
  const el = document.createElement("div");
  const anim = mockAnim();
  el.animate = vi.fn(() => anim) as unknown as typeof el.animate;
  return { el, anim };
}

const rect = (x: number, y: number, w: number, h: number): DOMRect =>
  ({ left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, x, y, toJSON: () => {} }) as DOMRect;

declare global {
  var ScrollTimeline: new (...args: unknown[]) => AnimationTimeline;
  var ViewTimeline: new (...args: unknown[]) => AnimationTimeline;
}

const KF: Keyframe[] = [{ opacity: "0" }, { opacity: "1" }];
const OPTS: KeyframeAnimationOptions = { duration: 300 };

beforeEach(() => {
  vi.stubGlobal("ScrollTimeline", vi.fn(() => ({})));
  vi.stubGlobal("ViewTimeline", vi.fn(() => ({})));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

// makeAnimate

describe("makeAnimate", () => {
  it("calls el.animate with the provided keyframes and options", () => {
    const { el, anim } = makeEl();
    const result = makeAnimate(el, KF, OPTS);
    expect(el.animate).toHaveBeenCalledWith(KF, OPTS);
    expect(result).toBe(anim);
  });

  it("accepts null keyframes", () => {
    const { el } = makeEl();
    makeAnimate(el, null);
    expect(el.animate).toHaveBeenCalledWith(null, undefined);
  });
});

// createAnimate

describe("createAnimate", () => {
  it("returns undefined when target is null", () => {
    createRoot(dispose => {
      const anim = createAnimate(() => null, KF, OPTS);
      expect(anim()).toBeUndefined();
      dispose();
    });
  });

  it("creates an animation when target becomes available", () => {
    const { el, anim } = makeEl();
    const [target, setTarget] = createSignal<Element | null>(null);
    let result!: ReturnType<typeof createAnimate>;
    const dispose = createRoot(d => {
      result = createAnimate(target, KF, OPTS);
      return d;
    });

    expect(result()).toBeUndefined();
    setTarget(el);
    flush();
    expect(el.animate).toHaveBeenCalledWith(KF, OPTS);
    expect(result()).toBe(anim);
    dispose();
  });

  it("cancels the old animation and creates a new one when keyframes change", () => {
    const { el } = makeEl();
    const anim1 = mockAnim();
    const anim2 = mockAnim();
    (el.animate as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(anim1)
      .mockReturnValueOnce(anim2);

    const [kf, setKf] = createSignal<Keyframe[]>(KF);
    const dispose = createRoot(d => {
      createAnimate(() => el, kf, OPTS);
      flush();
      return d;
    });

    expect(el.animate).toHaveBeenCalledTimes(1);
    setKf([{ transform: "scale(0)" }, { transform: "none" }]);
    flush();
    expect(anim1.cancel).toHaveBeenCalledOnce();
    expect(el.animate).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("cancels the animation when the owner is disposed", () => {
    const { el, anim } = makeEl();
    const dispose = createRoot(d => {
      createAnimate(() => el, KF, OPTS);
      flush();
      return d;
    });

    expect(anim.cancel).not.toHaveBeenCalled();
    dispose();
    expect(anim.cancel).toHaveBeenCalledOnce();
  });

  it("resets to undefined when target becomes null after being set", () => {
    const { el } = makeEl();
    const [target, setTarget] = createSignal<Element | null>(el);
    let result!: ReturnType<typeof createAnimate>;
    const dispose = createRoot(d => {
      result = createAnimate(target, KF, OPTS);
      flush();
      return d;
    });

    expect(result()).toBeDefined();
    setTarget(null);
    flush();
    expect(result()).toBeUndefined();
    dispose();
  });
});

// makeScrollAnimation

describe("makeScrollAnimation", () => {
  it("constructs a ScrollTimeline and passes it to el.animate", () => {
    const { el } = makeEl();
    makeScrollAnimation(el, KF, OPTS);

    expect(globalThis.ScrollTimeline).toHaveBeenCalledWith({ source: undefined, axis: undefined });
    expect(el.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ timeline: {} }));
  });

  it("forwards source and axis to ScrollTimeline", () => {
    const { el } = makeEl();
    const source = document.createElement("div");
    makeScrollAnimation(el, KF, { duration: 300, source, axis: "block" });

    expect(globalThis.ScrollTimeline).toHaveBeenCalledWith({ source, axis: "block" });
    expect(el.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ duration: 300 }));
    // source and axis must not bleed into animOptions
    expect(el.animate).toHaveBeenCalledWith(
      KF,
      expect.not.objectContaining({ source, axis: "block" }),
    );
  });
});

// createScrollAnimation

describe("createScrollAnimation", () => {
  it("returns undefined when target is null", () => {
    createRoot(dispose => {
      expect(createScrollAnimation(() => null, KF)()).toBeUndefined();
      dispose();
    });
  });

  it("creates a scroll animation when target is set", () => {
    const { el } = makeEl();
    const [target, setTarget] = createSignal<Element | null>(null);
    let result!: ReturnType<typeof createScrollAnimation>;
    const dispose = createRoot(d => {
      result = createScrollAnimation(target, KF, OPTS);
      return d;
    });

    setTarget(el);
    flush();
    expect(globalThis.ScrollTimeline).toHaveBeenCalled();
    expect(result()).toBeDefined();
    dispose();
  });

  it("cancels on dispose", () => {
    const { el, anim } = makeEl();
    const dispose = createRoot(d => {
      createScrollAnimation(() => el, KF, OPTS);
      flush();
      return d;
    });
    dispose();
    expect(anim.cancel).toHaveBeenCalledOnce();
  });
});

// makeViewAnimation

describe("makeViewAnimation", () => {
  it("defaults subject to the target element", () => {
    const { el } = makeEl();
    makeViewAnimation(el, KF, OPTS);

    expect(globalThis.ViewTimeline).toHaveBeenCalledWith(
      expect.objectContaining({ subject: el }),
    );
  });

  it("uses an explicit subject when provided", () => {
    const { el } = makeEl();
    const subject = document.createElement("section");
    makeViewAnimation(el, KF, { ...OPTS, subject });

    expect(globalThis.ViewTimeline).toHaveBeenCalledWith(
      expect.objectContaining({ subject }),
    );
  });

  it("forwards axis and inset to ViewTimeline and strips them from animOptions", () => {
    const { el } = makeEl();
    makeViewAnimation(el, KF, { duration: 400, axis: "inline", inset: "auto 10%" });

    expect(globalThis.ViewTimeline).toHaveBeenCalledWith(
      expect.objectContaining({ axis: "inline", inset: "auto 10%" }),
    );
    expect(el.animate).toHaveBeenCalledWith(
      KF,
      expect.not.objectContaining({ axis: "inline", inset: "auto 10%" }),
    );
  });
});

// createViewAnimation

describe("createViewAnimation", () => {
  it("returns undefined when target is null", () => {
    createRoot(dispose => {
      expect(createViewAnimation(() => null, KF)()).toBeUndefined();
      dispose();
    });
  });

  it("creates a view animation when target is set", () => {
    const { el } = makeEl();
    const [target, setTarget] = createSignal<Element | null>(null);
    let result!: ReturnType<typeof createViewAnimation>;
    const dispose = createRoot(d => {
      result = createViewAnimation(target, KF);
      return d;
    });

    setTarget(el);
    flush();
    expect(globalThis.ViewTimeline).toHaveBeenCalled();
    expect(result()).toBeDefined();
    dispose();
  });

  it("cancels on dispose", () => {
    const { el, anim } = makeEl();
    const dispose = createRoot(d => {
      createViewAnimation(() => el, KF, OPTS);
      flush();
      return d;
    });
    dispose();
    expect(anim.cancel).toHaveBeenCalledOnce();
  });
});

// makeFlip

describe("makeFlip", () => {
  it("flip returns undefined if snapshot was never called", () => {
    const { el } = makeEl();
    const { flip } = makeFlip(el, OPTS);
    expect(flip()).toBeUndefined();
    expect(el.animate).not.toHaveBeenCalled();
  });

  it("animates from the snapshotted geometry to the new geometry", () => {
    const { el } = makeEl();
    vi.spyOn(el, "getBoundingClientRect")
      .mockReturnValueOnce(rect(0, 0, 100, 50))   // snapshot
      .mockReturnValueOnce(rect(20, 10, 100, 50)); // flip

    const { snapshot, flip } = makeFlip(el, OPTS);
    snapshot();
    flip();

    expect(el.animate).toHaveBeenCalledWith(
      [
        { transformOrigin: "top left", transform: "translate(-20px, -10px) scale(1, 1)" },
        { transformOrigin: "top left", transform: "none" },
      ],
      OPTS,
    );
  });

  it("returns undefined and skips animate when geometry is unchanged", () => {
    const { el } = makeEl();
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue(rect(0, 0, 100, 50));

    const { snapshot, flip } = makeFlip(el, OPTS);
    snapshot();
    expect(flip()).toBeUndefined();
    expect(el.animate).not.toHaveBeenCalled();
  });

  it("resets after flip so a second flip without a new snapshot is a no-op", () => {
    const { el } = makeEl();
    vi.spyOn(el, "getBoundingClientRect")
      .mockReturnValueOnce(rect(0, 0, 100, 50))
      .mockReturnValueOnce(rect(20, 10, 100, 50));

    const { snapshot, flip } = makeFlip(el, OPTS);
    snapshot();
    flip();
    expect(flip()).toBeUndefined(); // no snapshot → no-op
    expect(el.animate).toHaveBeenCalledTimes(1);
  });

  it("accounts for size changes via scale", () => {
    const { el } = makeEl();
    vi.spyOn(el, "getBoundingClientRect")
      .mockReturnValueOnce(rect(0, 0, 200, 100))  // snapshot: larger
      .mockReturnValueOnce(rect(0, 0, 100, 50));   // flip: smaller

    const { snapshot, flip } = makeFlip(el);
    snapshot();
    flip();

    expect(el.animate).toHaveBeenCalledWith(
      [
        { transformOrigin: "top left", transform: "translate(0px, 0px) scale(2, 2)" },
        { transformOrigin: "top left", transform: "none" },
      ],
      undefined,
    );
  });
});

// makeStagger

describe("makeStagger", () => {
  it("animates each element with staggered delays", () => {
    const els = [document.createElement("div"), document.createElement("div"), document.createElement("div")];
    els.forEach(el => { el.animate = vi.fn(() => mockAnim()) as unknown as typeof el.animate; });

    makeStagger(els, KF, { duration: 300, stagger: 50 });

    expect(els[0]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 0 }));
    expect(els[1]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 50 }));
    expect(els[2]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 100 }));
  });

  it("stacks stagger on top of the base delay", () => {
    const els = [document.createElement("div"), document.createElement("div")];
    els.forEach(el => { el.animate = vi.fn(() => mockAnim()) as unknown as typeof el.animate; });

    makeStagger(els, KF, { delay: 100, stagger: 50 });

    expect(els[0]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 100 }));
    expect(els[1]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 150 }));
  });

  it("defaults stagger to 0 when not provided", () => {
    const els = [document.createElement("div"), document.createElement("div")];
    els.forEach(el => { el.animate = vi.fn(() => mockAnim()) as unknown as typeof el.animate; });

    makeStagger(els, KF, { delay: 0 });

    expect(els[0]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 0 }));
    expect(els[1]!.animate).toHaveBeenCalledWith(KF, expect.objectContaining({ delay: 0 }));
  });

  it("returns one Animation per element", () => {
    const els = [document.createElement("div"), document.createElement("div")];
    const anims = els.map(() => mockAnim());
    els.forEach((el, i) => { el.animate = vi.fn(() => anims[i]) as unknown as typeof el.animate; });

    const result = makeStagger(els, KF, { stagger: 100 });
    expect(result).toHaveLength(2);
    expect(result[0]).toBe(anims[0]);
    expect(result[1]).toBe(anims[1]);
  });
});

// createStagger

describe("createStagger", () => {
  it("creates animations for each non-null target", () => {
    const els = [document.createElement("div"), document.createElement("div")];
    els.forEach(el => { el.animate = vi.fn(() => mockAnim()) as unknown as typeof el.animate; });

    createRoot(dispose => {
      const anims = createStagger(() => els, KF, { stagger: 50 });
      flush();
      expect(anims()).toHaveLength(2);
      expect(els[0]!.animate).toHaveBeenCalled();
      expect(els[1]!.animate).toHaveBeenCalled();
      dispose();
    });
  });

  it("filters out null and undefined targets", () => {
    const el = document.createElement("div");
    el.animate = vi.fn(() => mockAnim()) as unknown as typeof el.animate;

    createRoot(dispose => {
      const anims = createStagger(() => [el, null, undefined], KF);
      flush();
      expect(anims()).toHaveLength(1);
      dispose();
    });
  });

  it("cancels all animations on dispose", () => {
    const els = [document.createElement("div"), document.createElement("div")];
    const anims = els.map(() => mockAnim());
    els.forEach((el, i) => { el.animate = vi.fn(() => anims[i]) as unknown as typeof el.animate; });

    const dispose = createRoot(d => {
      createStagger(() => els, KF, { stagger: 50 });
      flush();
      return d;
    });

    dispose();
    expect(anims[0]!.cancel).toHaveBeenCalledOnce();
    expect(anims[1]!.cancel).toHaveBeenCalledOnce();
  });

  it("cancels old animations and restarts when targets change", () => {
    const el1 = document.createElement("div");
    const el2 = document.createElement("div");
    const anim1 = mockAnim();
    const anim2 = mockAnim();
    el1.animate = vi.fn(() => anim1) as unknown as typeof el1.animate;
    el2.animate = vi.fn(() => anim2) as unknown as typeof el2.animate;

    const [targets, setTargets] = createSignal<Element[]>([el1]);
    const dispose = createRoot(d => {
      createStagger(targets, KF);
      flush();
      return d;
    });

    expect(el1.animate).toHaveBeenCalledTimes(1);
    setTargets([el1, el2]);
    flush();
    expect(anim1.cancel).toHaveBeenCalledOnce();
    expect(el1.animate).toHaveBeenCalledTimes(2);
    expect(el2.animate).toHaveBeenCalledTimes(1);
    dispose();
  });
});

// makeAnimationGroup

describe("makeAnimationGroup", () => {
  it("forwards play, pause, cancel, reverse, and finish to all animations", () => {
    const a = mockAnim();
    const b = mockAnim();
    const group = makeAnimationGroup([a, b]);

    group.play();
    expect(a.play).toHaveBeenCalledOnce();
    expect(b.play).toHaveBeenCalledOnce();

    group.pause();
    expect(a.pause).toHaveBeenCalledOnce();
    expect(b.pause).toHaveBeenCalledOnce();

    group.cancel();
    expect(a.cancel).toHaveBeenCalledOnce();
    expect(b.cancel).toHaveBeenCalledOnce();

    group.reverse();
    expect(a.reverse).toHaveBeenCalledOnce();
    expect(b.reverse).toHaveBeenCalledOnce();

    group.finish();
    expect(a.finish).toHaveBeenCalledOnce();
    expect(b.finish).toHaveBeenCalledOnce();
  });

  it("skips null and undefined entries", () => {
    const a = mockAnim();
    const group = makeAnimationGroup([a, null, undefined]);

    group.play();
    expect(a.play).toHaveBeenCalledOnce();
  });

  it("does nothing when the list is empty", () => {
    expect(() => makeAnimationGroup([]).play()).not.toThrow();
  });
});
