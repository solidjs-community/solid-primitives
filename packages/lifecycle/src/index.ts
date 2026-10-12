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

export function createIsMounted(): Accessor<boolean> {
  if (isServer) return () => false;
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => setIsMounted(true));
  return isMounted;
}

export const isHydrated = (): boolean =>
  !isServer && (!sharedConfig.context || (!!getListener() && createIsMounted()()));

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
  delayMs?: number;
  idle?: boolean;
  idleTimeout?: number;
}

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
