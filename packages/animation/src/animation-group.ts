import { createMemo, type Accessor } from "solid-js";

export type AnimationGroupControls = {
  play: () => void;
  pause: () => void;
  cancel: () => void;
  reverse: () => void;
  finish: () => void;
};

/**
 * Coordinates a static list of `Animation` objects as a single unit.
 * Each control method is forwarded to all non-null animations simultaneously.
 *
 * Pairs naturally with {@link makeAnimate} and {@link makeStagger}.
 */
export function makeAnimationGroup(
  animations: (Animation | null | undefined)[],
): AnimationGroupControls {
  const all = animations.filter((a): a is Animation => a != null);
  return {
    play: () => all.forEach(a => a.play()),
    pause: () => all.forEach(a => a.pause()),
    cancel: () => all.forEach(a => a.cancel()),
    reverse: () => all.forEach(a => a.reverse()),
    finish: () => all.forEach(a => a.finish()),
  };
}

/**
 * Reactive wrapper around {@link makeAnimationGroup}. Re-derives the group
 * controls whenever the `animations` accessor returns a new list.
 *
 * Each method on the returned object always operates on the most recent set of
 * animations — calling `play()` after the list changes will target the new
 * animations, not the old ones.
 */
export function createAnimationGroup(
  animations: Accessor<(Animation | null | undefined)[]>,
): AnimationGroupControls {
  const group = createMemo(() => makeAnimationGroup(animations()));
  return {
    play: () => group().play(),
    pause: () => group().pause(),
    cancel: () => group().cancel(),
    reverse: () => group().reverse(),
    finish: () => group().finish(),
  };
}
