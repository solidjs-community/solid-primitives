import {
  $REFRESH,
  type ProjectionOptions,
  type StoreSetter,
  type Refreshable,
} from "@solidjs/signals";
import { createEffect, getOwner, untrack } from "solid-js";
import { isServer } from "@solidjs/web";
import type { ReactiveCollectionComputeOptions } from "./index.ts";

export function storeOptions(
  options?: ReactiveCollectionComputeOptions<unknown>,
): ProjectionOptions {
  return {
    name: options?.name,
    shallow: true,
    key: null,
    seedLoadingValue: options?.loadingValue !== undefined,
    deferStream: options?.deferStream,
    ssrSource: options?.ssrSource,
  };
}

// Reserve the same owner slot on both runtimes. SSR must not read a client-only source.
export function observeKeys(marker: () => object, adopt: () => void): void {
  if (getOwner())
    createEffect(() => (isServer ? undefined : marker()), { effect: adopt, error: () => {} });
}

// A separate closure avoids retaining the input or an old loading seed.
// Bookkeeping must stay untracked even when the producer writes after an await.
export function collectionWriter<T>(state: T): StoreSetter<T> {
  return fn => {
    untrack(() => fn(state));
  };
}

export function collectionView<Draft, Data extends { readonly _state: Record<PropertyKey, any> }>(
  View: new () => Draft & { readonly _data: Data },
  data: Data,
): Refreshable<Draft> {
  return Object.defineProperties<Draft>(new View(), {
    _data: { value: data },
    [$REFRESH]: { get: () => data._state[$REFRESH] },
  }) as Refreshable<Draft>;
}

export function* setEntries<K>(values: Iterable<K>): Generator<readonly [K, true]> {
  for (const key of values) yield [key, true];
}

export function deleteSlot(state: Record<string, unknown>, slot: string): void {
  delete state[slot];
  delete state["k:" + slot];
}
