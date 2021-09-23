import { StorageWithOptions } from ".";

export const addClearMethod = <S extends Storage | StorageWithOptions<any>>(
  storage: Omit<S, "clear">
): S => {
  if (typeof storage.clear === "function") {
    return storage as S;
  }
  (storage as S).clear = () => {
    let key;
    while ((key = storage.key(0))) {
      storage.removeItem(key);
    }
  };
  return storage as S;
};
