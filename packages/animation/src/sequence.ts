/** A zero-argument factory that creates an `Animation` when called. */
export type AnimationFactory = () => Animation | null | undefined;

export type SequenceControls = {
  /** Starts the sequence from the first factory. Discards any in-progress run. */
  play: () => void;
  /** Stops the sequence. The currently-playing animation is cancelled. */
  cancel: () => void;
};

/**
 * Chains animation factories into a sequential playlist: each factory is
 * called and its animation allowed to finish before the next factory runs.
 *
 * Factories are invoked **lazily** — each is called only when its turn
 * arrives, so animations are created and started just in time rather than
 * all at once upfront. Passing `null`/`undefined` from a factory skips that
 * step without breaking the chain.
 *
 * Calling `play()` while a sequence is running discards the current run and
 * starts fresh from the beginning.
 *
 * @example
 * ```ts
 * const seq = makeSequence([
 *   () => makeAnimate(headerEl, fadeIn, { duration: 300 }),
 *   () => makeAnimate(bodyEl,   slideIn, { duration: 400 }),
 *   () => makeAnimate(footerEl, fadeIn,  { duration: 300 }),
 * ]);
 *
 * seq.play();   // header → body → footer, each starts after the last finishes
 * seq.cancel(); // stops immediately
 * seq.play();   // restart from the beginning
 * ```
 */
export function makeSequence(factories: AnimationFactory[]): SequenceControls {
  let generation = 0;
  let current: Animation | null = null;

  return {
    play() {
      current?.cancel();
      const gen = ++generation;
      let i = 0;

      const next = () => {
        if (gen !== generation || i >= factories.length) return;
        const anim = factories[i++]!();
        if (!anim) { next(); return; }
        current = anim;
        anim.addEventListener("finish", next, { once: true });
      };

      next();
    },
    cancel() {
      generation++;
      current?.cancel();
      current = null;
    },
  };
}
