import { StorageWithOptions } from ".";

/**
 * adds a `.clear` method to a Storage without one only using `.key`/`.removeItem`
 */
export const addClearMethod = <S extends Storage | StorageWithOptions<any>>(
  storage: Omit<S, "clear"> & { clear?: () => void }
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
