import { Accessor, createSignal } from "solid-js";

type Status = "pending" | "fulfilled" | "rejected";

export interface ShareDataWithFiles extends ShareData {
  files?: File[];
}

/**
 * Creates a reactive status about web share. For example:
 * ```ts
 * const shareStatus = createWebShare({url: "https://www.solidjs.com/"});
 * createEffect(() => {
 *     if (shareStatus() === 'fulfilled') {
 *         console.log("successful sharing.");
 *     }
 * })
 * ```
 * @param data Share data, which has properties of `title`, `url`, `text` and `files`.
 * @returns A signal that has three status: `pending`, `fulfilled`, `rejected`.
 */
export const createWebShare = (data: ShareDataWithFiles = {}): Accessor<Status> => {
  const [status, setStatus] = createSignal<Status>("pending");

  if (process.env.SSR) {
    return status;
  }

  // Some browsers do not support `WebShare`, so sharing failed.
  if (!navigator.share) {
    console.error("your browser does not support web share.");
    setStatus("rejected");
    return status;
  }

  // Some browsers do not support `files` and `navigator.canShare`, so sharing failed.
  if (data.files && (!navigator.canShare || !navigator.canShare(data))) {
    console.error("your browser does not support share files.");
    setStatus("rejected");
    return status;
  }

  try {
    navigator
      .share(data)
      .then(() => {
        setStatus("fulfilled");
      })
      .catch(err => {
        setStatus("rejected");
        console.error(err);
      });
  } catch (e) {
    setStatus("rejected");
    console.error(e);
  }
  return status;
};
