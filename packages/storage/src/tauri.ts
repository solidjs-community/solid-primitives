import type { StoreOptions } from "@tauri-apps/plugin-store";
import { AsyncStorage } from "@solid-primitives/storage";

/**
 * tauriStorage: an asynchronous Storage API based on tauri-plugin-store
 *
 * requires store permissions to be set: https://tauri.app/plugin/store/
 *
 * In order to use in a isomorphic setting (web/tauri), use:
 * ```ts
 * const isFallback = !window.__TAURI_INTERNALS__;
 * const storage = isFallback ? localStorage : tauriStorage();
 * ````
 */
export function tauriStorage(
  name = "solid-storage.dat",
  options: StoreOptions = {},
) {
  const api: AsyncStorage = {
    _store: null,
    _getStore: async () => {
      if (!api._store) {
        // @ts-ignore
        const store = await import("@tauri-apps/plugin-store");
        api._store = await store.load(name, options);
      }
      return api._store;
    },
    getItem: async (key: string) => (await (await api._getStore()).get(key)) ?? null,
    setItem: async (key: string, value: string) => await (await api._getStore()).set(key, value),
    removeItem: async (key: string) => await (await api._getStore()).delete(key),
    clear: async () => await (await api._getStore()).clear(),
    key: async (index: number) => (await (await api._getStore()).keys())[index],
    getLength: async () => (await api._getStore()).length(),
    get length() {
      return api.getLength();
    },
  };
  return api;
}
