import { Accessor, createSignal } from "solid-js";

type Status = "pending" | "fulfilled" | "rejected";

/**
 * Creates a simple reactive status about web share. For example:
 * ```ts
 * const shareStatus = createWebShare({url: "https://www.solidjs.com/"});
 * createEffect(() => {
 *     if (shareStatus() === 'fulfilled') {
 *         console.log("successful sharing.");
 *     }
 * })
 * ```
 * @param data Share data which has properties of `title`, `url` and `text`. It does not have `files` property.
 * @returns A signal that has three status: `pending`, `fulfilled`, `rejected`
 */
export const createWebShare = (data: ShareData = {}): Accessor<Status> => {
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

  try {
    navigator
      .share(data)
      .then(() => {
        setStatus("fulfilled");
      })
      .catch(err => {
        setStatus("rejected");
        console.log(err);
      });
  } catch (e) {
    setStatus("rejected");
    console.error(e);
  }
  return status;
};

export interface NaughtyShareData extends ShareData {
  files?: File[];
}

/**
 * Creates a naughty reactive status about web share, which support sharing `files`. For example:
 * ```ts
 * const file = new File([new Blob(['text'])], "file.txt");
 * const shareStatus = createNaughtyWebShare({ files: Object.freeze([file]) });
 * createEffect(() => {
 *     if (shareStatus() === 'fulfilled') {
 *         console.log("successful sharing.");
 *     }
 * })
 * ```
 * @param data Share data, which has properties of `title`, `url`, `text` and `files`.
 * @returns A signal that has three status: `pending`, `fulfilled`, `rejected`.
 */
export const createNaughtyWebShare = (data: NaughtyShareData = {}): Accessor<Status> => {
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
    console.log("your browser does not support share files.");
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
        console.log(err);
      });
  } catch (e) {
    setStatus("rejected");
    console.error(e);
  }
  return status;
};
