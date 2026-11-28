import { type Accessor, createSignal, getObserver, getOwner, onCleanup, onSettled } from "solid-js";
import { sharedConfig } from "solid-js/internal";
import { isServer } from "@solidjs/web";

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
  onSettled(() => {
    setIsMounted(true);
  });
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
  !isServer && (!sharedConfig.hydrating || (!!getObserver() && createIsMounted()()));

/**
 * Calls the {@link fn} callback when the {@link el} is connected to the DOM.
 *
 * Safe inside a ref callback: it never calls `onCleanup`, which Solid forbids there.
 * The observer disconnects itself once the element connects.
 * To also stop waiting when the owner is disposed, use {@link createConnectRef} or `onCleanup(onElementConnect(...))`.
 * @param el target element
 * @param fn callback
 * @returns a function that stops waiting for the connection
 * @example
 * ```tsx
 * <div ref={createConnectRef(el => {
 *   el.isConnected // => always true
 * })} />
 * ```
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/lifecycle#onElementConnect
 */
export function onElementConnect(el: Element, fn: VoidFunction): VoidFunction {
  if (isServer) return noop;
  if (el.isConnected) {
    fn();
    return noop;
  }
  const observer: ResizeObserver = new ResizeObserver(
    () => el.isConnected && (observer.disconnect(), fn()),
  );
  observer.observe(el);
  return () => observer.disconnect();
}

/**
 * Creates a `ref` callback that calls {@link fn} with each element once it is connected to the DOM.
 * Call it in the component body: pending observers are disconnected when the owner is disposed.
 * @example
 * ```tsx
 * <div ref={createConnectRef(el => console.log(el.isConnected))} />
 * ```
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/lifecycle#createConnectRef
 */
export function createConnectRef<T extends Element = Element>(
  fn: (el: T) => void,
): (el: T) => void {
  if (isServer) return noop;
  const stops = new Map<object, VoidFunction>();
  // The ref callback can't call onCleanup, so the factory registers the teardown.
  if (getOwner()) {
    onCleanup(() => {
      stops.forEach(stop => stop());
      stops.clear();
    });
  }
  return el => {
    if (el.isConnected) return fn(el);
    const key = {};
    stops.set(
      key,
      onElementConnect(el, () => {
        stops.delete(key);
        fn(el);
      }),
    );
  };
}

const noop = (): void => {};
