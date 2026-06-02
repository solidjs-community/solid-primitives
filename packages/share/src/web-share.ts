import { type Accessor, action, createOptimistic, createSignal } from "solid-js";
import { isServer } from "@solidjs/web";
import { INTERNAL_OPTIONS } from "@solid-primitives/utils";

/**
 * Generates a simple non-reactive WebShare primitive for sharing.
 *
 * @returns share - start web share with ShareData.
 *
 * @example
 * ```ts
 * const share = makeWebShare();
 * try {
 *   await share({ url: "https://solidjs.com" });
 * } catch (e) {
 *   console.error(e);
 * }
 * ```
 */
export const makeWebShare = () => {
  const share = (data: ShareData) => {
    // Some browsers do not support `WebShare`, so sharing failed.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!navigator.share) {
      return Promise.reject("your browser does not support web share.");
    }

    // Some browsers do not support `files` and `navigator.canShare`, so sharing failed.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (data.files && (!navigator.canShare || !navigator.canShare(data))) {
      return Promise.reject("your browser does not support share files.");
    }

    try {
      return navigator.share(data);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  return share;
};

export type WebShareResult = {
  /** Imperatively trigger the Web Share API with the provided data. */
  share: (data: ShareData) => Promise<void>;
  /** True while the share dialog is open / the promise is pending. */
  pending: Accessor<boolean>;
  /** True on success, false on failure, undefined before first share. */
  status: Accessor<boolean | undefined>;
  /** The error message if the share failed, otherwise undefined. */
  message: Accessor<string | undefined>;
};

/**
 * Creates an action-based Web Share primitive with reactive status tracking.
 *
 * @returns An object with a `share` action and reactive `pending`, `status`, and `message` accessors.
 *
 * @example
 * ```ts
 * const { share, pending, status, message } = createWebShare();
 *
 * // Call imperatively on user gesture:
 * <button onClick={() => share({ url: location.href, title: document.title })}>
 *   Share
 * </button>
 * ```
 */
export const createWebShare = (): WebShareResult => {
  if (isServer) {
    return {
      share: () => Promise.resolve(),
      pending: () => false,
      status: () => undefined,
      message: () => undefined,
    };
  }

  const [pending, setPending] = createOptimistic(false, INTERNAL_OPTIONS);
  const [status, setStatus] = createSignal<boolean | undefined>(undefined, INTERNAL_OPTIONS);
  const [message, setMessage] = createSignal<string | undefined>(undefined, INTERNAL_OPTIONS);
  const baseShare = makeWebShare();

  const share = action(function* (data: ShareData) {
    setPending(true);
    setStatus(undefined);
    setMessage(undefined);
    try {
      yield baseShare(data);
      setStatus(true);
    } catch (e: unknown) {
      setStatus(false);
      setMessage(String(e));
    }
    setPending(false);
  });

  return { share, pending, status, message };
};
