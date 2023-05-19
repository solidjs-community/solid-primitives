import { $PROXY, $TRACK, createMemo, createRoot, createSignal, untrack } from "solid-js";
import { Store, unwrap } from "solid-js/store";

const EQUALS_FALSE = { equals: false } as const;

type StoreNode = object & Record<typeof $TRACK, unknown>;

const TrackStoreCache = new WeakMap<StoreNode, VoidFunction>();
let TrackVersion = 0;

// custom lazy memo to support circular dependencies
// maybe it won't be needed in 2.0
function createLazyMemo(calc: VoidFunction): VoidFunction {
  let isReading = false,
    isStale: boolean | undefined = true,
    alreadyTracked = false,
    version = 0;

  const [track, trigger] = createSignal(void 0, EQUALS_FALSE),
    memo = createMemo(() => (isReading ? calc() : (isStale = !track())), undefined, {
      equals: () => alreadyTracked,
    });

  return () => {
    isReading = true;
    if (isStale) isStale = trigger();
    alreadyTracked = version === TrackVersion;
    version = TrackVersion;
    memo();
    isReading = false;
  };
}

function getTrackStoreNode(value: StoreNode): VoidFunction | undefined {
  let track = TrackStoreCache.get(value);

  if (!track) {
    createRoot(() => {
      const unwrapped = unwrap(value);

      track = createLazyMemo(() => {
        value[$TRACK];
        for (const [key, child] of Object.entries(unwrapped)) {
          let obj: StoreNode;
          if (
            child != null &&
            typeof child === "object" &&
            ((obj = (child as any)[$PROXY]) ||
              ((obj = untrack(() => (value as any)[key])) && $TRACK in obj))
          ) {
            getTrackStoreNode(obj)?.();
          }
        }
      });

      TrackStoreCache.set(value, track);
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
