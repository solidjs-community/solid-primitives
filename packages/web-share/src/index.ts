import { Accessor, createSignal, createEffect, on } from "solid-js";
import { createStore } from "solid-js/store";

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
    if (!navigator.share) {
      return Promise.reject("your browser does not support web share.");
    }

    // Some browsers do not support `files` and `navigator.canShare`, so sharing failed.
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

interface shareStatus {
  /** The status of sharing success, failed or pending. */
  status?: boolean;

  /** The massage of why sharing failed. */
  message?: string;
}

/**
 * Creates a reactive status about web share.
 *
 * @param data Data signal to share on web.
 * @param deferInitial - Sets the value of the clipboard from the signal. defaults to false.
 * @return A store shows sharing status and failing message.
 *
 * @example
 * ```ts
 * const [data, setData] = createSignal<ShareData>({});
 * const shareStatus = createWebShare(data);
 * ```
 */
export const createWebShare = (data?: Accessor<ShareData>, deferInitial?: boolean): shareStatus => {
  const [status, setStatus] = createStore<shareStatus>({});

  if (process.env.SSR) {
    return status;
  }

  const share = makeWebShare();
  if (data)
    createEffect(
      on(
        data,
        () => {
          share(data())
            .then(() => setStatus("status", true))
            .catch(e => {
              console.error(e);
              setStatus({ status: false, message: e.toString() });
            });
        },
        { defer: deferInitial || true }
      )
    );

  return status;
};
