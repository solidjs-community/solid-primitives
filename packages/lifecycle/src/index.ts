import {
  type Accessor,
  createSignal,
  getListener,
  getOwner,
  onCleanup,
  onMount,
  runWithOwner,
  sharedConfig,
  type Owner,
} from "solid-js";
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

export interface DeferredOptions {
  /**
   * Delay in milliseconds before executing the callback.
   * @default 250
   */
  delayMs?: number;
  /**
   * If true, uses requestIdleCallback when available instead of setTimeout.
   * @default false
   */
  idle?: boolean;
  /**
   * Maximum timeout in milliseconds when using requestIdleCallback.
   * @default 1000
   */
  idleTimeout?: number;
}

/**
 * Executes a callback exactly once after client-side hydration and the initial microtask queue have settled.
 * Preserves the reactive Owner context from the call-site.
 * Safe for SSR (no-op on server).
 *
 * @param fn Callback to execute post-hydration.
 * @example
 * ```tsx
 * onInitialRender(() => {
 *   initCanvasRenderer();
 * });
 * ```
 */
export function onInitialRender(fn: () => void | Promise<void>): void {
  if (isServer) return;

  const owner: Owner | null = getOwner();

  onMount(() => {
    let active = true;

    onCleanup(() => {
      active = false;
    });

    queueMicrotask(() => {
      if (!active) return;

      if (owner) {
        runWithOwner(owner, () => {
          void fn();
        });
      } else {
        void fn();
      }
    });
  });
}

/**
 * Defers callback execution until after a specified delay or idle window post-mount.
 * If the component unmounts before execution, the scheduled callback is aborted.
 * Preserves the reactive Owner context from the call-site.
 * Safe for SSR (no-op on server).
 *
 * @param fn Callback to execute after deferral.
 * @param options Configuration for delay or idle scheduling.
 * @returns An abort function to cancel execution manually if needed.
 * @example
 * ```tsx
 * onDeferred(() => {
 *   loadAnalytics();
 * }, { delayMs: 500, idle: true });
 * ```
 */
export function onDeferred(
  fn: () => void | Promise<void>,
  options: DeferredOptions | number = 250,
): () => void {
  if (isServer) return () => {};

  const config: DeferredOptions =
    typeof options === "number" ? { delayMs: options } : options;

  const delayMs = config.delayMs ?? 250;
  const useIdle = config.idle ?? false;
  const idleTimeout = config.idleTimeout ?? 1000;
  const owner: Owner | null = getOwner();

  let handle: number | ReturnType<typeof setTimeout> | null = null;
  let active = true;

  const cancel = (): void => {
    active = false;
    if (handle !== null) {
      if (useIdle && typeof window !== "undefined" && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(handle as number);
      } else {
        clearTimeout(handle as ReturnType<typeof setTimeout>);
      }
      handle = null;
    }
  };

  onMount(() => {
    onCleanup(cancel);

    const execute = (): void => {
      if (!active) return;
      handle = null;

      if (owner) {
        runWithOwner(owner, () => {
          void fn();
        });
      } else {
        void fn();
      }
    };

    if (useIdle && typeof window !== "undefined" && "requestIdleCallback" in window) {
      handle = window.requestIdleCallback(execute, { timeout: idleTimeout });
    } else {
      handle = setTimeout(execute, delayMs);
    }
  });

  return cancel;
}
