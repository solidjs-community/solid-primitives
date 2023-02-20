import { Accessor, createEffect, createSignal, on } from "solid-js";
import type { OnOptions } from "solid-js/types/reactive/signal";

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

export type ShareStatus = {
  /** The status of sharing success, failed or pending. */
  status?: boolean;

  /** The reason why sharing failed. */
  message?: string;
};

/**
 * Creates a reactive status about web share.
 *
 * @param data Data signal to share on web.
 * @param deferInitial - Sets the value of the web share data from the signal. defaults to false.
 * @return A store shows sharing status and failing message.
 *
 * @example
 * ```ts
 * const [data, setData] = createSignal<ShareData>({});
 * const shareStatus = createWebShare(data);
 *
 * createEffect(() => {
 *   console.log(shareStatus.status, shareStatus.message)
 * })
 * ```
 */
export const createWebShare = (
  data: Accessor<ShareData>,
  deferInitial: boolean = false
): ShareStatus => {
  if (process.env.SSR) {
    return {};
  }
  const [status, setStatus] = createSignal<ShareStatus>({});
  const share = makeWebShare();
  createEffect(
    on(
      data,
      data => {
        setStatus({});
        share(data)
          .then(() => setStatus({ status: true }))
          .catch(e => setStatus({ status: false, message: e.toString() }));
      },
      { defer: deferInitial } satisfies OnOptions as any
    )
  );

  return {
    get status() {
      return status().status;
    },
    get message() {
      return status().message;
    }
  };
};
