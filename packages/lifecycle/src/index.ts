import { type Accessor, createSignal, getListener, onCleanup, onMount, sharedConfig } from "solid-js";
import { isServer } from "solid-js/web";

/**
 * @returns a signal accessor that will return a `false` initially,
 * and then update to `true` once the owner is mounted.
 * @example
 * ```tsx
 * let ref: HTMLElement
 * const isMounted = createIsMounted();
 * const windowWidth = createMemo(() => isMounted() ? ref.offsetWidth : 0)
 * <div ref={ref}>{windowWidth()}</div>
 * ```
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/lifecycle#createIsMounted
 */
export function createIsMounted(): Accessor<boolean> {
  if (isServer) return () => false;
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => setIsMounted(true));
  return isMounted;
}

/**
 * @returns a `boolean` value representing if the hydration process of the current owner is complete.
 *
 * - `false` during SSR
 * - `false` on the client if the component evaluation is during a hydration process.
 * - `true` on the client if the component evaluates after hydration or during clinet-side rendering.
 *
 * Switching from `false` to `true` will trigger the signal to update.
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/lifecycle#isHydrated
 */
export const isHydrated = (): boolean =>
  !isServer && (!sharedConfig.context || (!!getListener() && createIsMounted()()));

/**
 * Calls the {@link fn} callback when the {@link el} is connected to the DOM.
 * @param el target element
 * @param fn callback
 * @example
 * ```tsx
 * <div ref={el => {
 *   el.isConnected // => often false
 *   onMount(() => {
 *     el.isConnected // => often true
 *   })
 *   onConnect(el, () => {
 *     el.isConnected // => always true
 *   })
 * }} />
 * ```
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/lifecycle#onConnect
 */
export function onElementConnect(el: Element, fn: VoidFunction): void {
  if (isServer) return;
  if (el.isConnected) return fn();
  const observer: ResizeObserver = new ResizeObserver(
    () => el.isConnected && (observer.disconnect(), fn()),
  );
  observer.observe(el);
  onCleanup(() => observer.disconnect());
}
