import { StorageWithOptions } from "./index.js";

/**
 * adds a `.clear` method to a Storage without one only using `.key`/`.removeItem`
 */
export const addClearMethod = <S extends Storage | StorageWithOptions<any>>(
  storage: Omit<S, "clear"> & { clear?: () => void },
): S => {
  if (typeof storage.clear === "function") {
    return storage as S;
  }
  (storage as S).clear = () => {
    let key;
    while ((key = storage.key!(0))) {
      storage.removeItem!(key);
    }
  };
  return storage as S;
};

/**
 * Generates a broadcast name which can be used for syncing storage change events between windows and tabs base on the `name`
 * @param name Name of the storage item to be synced
 */
export const getSyncBroadcastName = (name: string) => {
  return "storage-sync-" + name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
}
