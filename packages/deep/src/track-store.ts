import { $PROXY, $TRACK, createMemo, createRoot, createSignal, untrack } from "solid-js";
import { type Store, unwrap } from "solid-js/store";

const EQUALS_FALSE = { equals: false } as const;

type StoreNode = Record<typeof $TRACK | string, any>;

const TrackStoreCache = new WeakMap<StoreNode, VoidFunction>();

// for preventing the same object to be visited multiple times in the same trackStore call
let TrackVersion = 0;

function getTrackStoreNode(node: StoreNode): VoidFunction | undefined {
  let track = TrackStoreCache.get(node);

  if (!track) {
    createRoot(() => {
      const unwrapped = unwrap(node);

      // custom lazy memo to support circular references
      // maybe it won't be needed in solid 2.0

      let is_reading = false;
      let is_stale = true;
      let version = 0;

      const [signal, trigger] = createSignal(undefined, EQUALS_FALSE);

      const memo = createMemo(
        () => {
          if (is_reading) {
            node[$TRACK]; // shallow track store node

            // track each child node
            for (const [key, child] of Object.entries(unwrapped)) {
              let childNode: StoreNode;
              if (
                child != null &&
                typeof child === "object" &&
                ((childNode = child[$PROXY]) || $TRACK in (childNode = untrack(() => node[key])))
              ) {
                getTrackStoreNode(childNode)?.();
              }
            }
          } else {
            signal();
            is_stale = true;
          }
        },
        undefined,
        EQUALS_FALSE,
      );

      track = () => {
        is_reading = true;
        if (is_stale) {
          trigger();
          is_stale = false;
        }
        const already_tracked = version === TrackVersion;
        version = TrackVersion;
        already_tracked || memo();
        is_reading = false;
      };

      TrackStoreCache.set(node, track);
    });
  }

  return track;
}

/**
 * Tracks all nested changes to passed {@link store}.
 *
 * @param store a reactive store proxy
 * @returns same {@link store} that was passed in
 *
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/deep#trackStore
 *
 * @example
 * ```ts
 * createEffect(on(
 *   () => trackStore(store),
 *   () => {
 *     // this effect will run when any property of store changes
 *   }
 * ));
 * ```
 */
function trackStore<T extends object>(store: Store<T>): T {
  TrackVersion++;
  $TRACK in store && getTrackStoreNode(store)?.();
  return store;
}

export { trackStore };
