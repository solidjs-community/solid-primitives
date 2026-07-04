import { createSignal, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import type { Accessor } from "solid-js";

/**
 * Returns a reactive accessor that reflects the user's `prefers-reduced-motion` system
 * preference. Automatically updates when the OS setting changes.
 *
 * Returns `false` on the server (SSR-safe).
 *
 * @returns `Accessor<boolean>` — `true` if the user has enabled "Reduce Motion".
 *
 * @example
 * ```tsx
 * const prefersReduced = createReducedMotion();
 *
 * return (
 *   <div class={prefersReduced() ? "" : "animate-fade-in"}>
 *     Content
 *   </div>
 * );
 * ```
 *
 * @example
 * ```ts
 * // Gate CSS transitions inline
 * const style = () => ({
 *   transition: prefersReduced() ? "none" : "transform 0.3s ease",
 * });
 * ```
 */
export function createReducedMotion(): Accessor<boolean> {
  if (isServer) return () => false;

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const [prefersReduced, setPrefersReduced] = createSignal(mq.matches);

  const onChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
  mq.addEventListener("change", onChange);
  onCleanup(() => mq.removeEventListener("change", onChange));

  return prefersReduced;
}
