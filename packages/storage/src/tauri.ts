import { AsyncStorage } from "./persisted.js";

/**
 * tauriStorage: an asynchronous Storage API based on tauri-plugin-store
 *
 * requires store permissions to be set: https://beta.tauri.app/features/store/
 *
 * In order to use in a isomorphic setting (web/tauri), use:
 * ```ts
 * const isFallback = !window.__TAURI_INTERNALS__;
 * const storage = isFallback ? localStorage : tauriStorage();
 * ````
 */
export function tauriStorage(name = "solid-storage.dat") {
  const api: AsyncStorage = {
    _store: null,
    _getStore: async () =>
      // @ts-ignore
      api._store || (api._store = new (await import("@tauri-apps/plugin-store")).Store(name)),
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
