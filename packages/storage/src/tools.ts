import { StorageWithOptions } from ".";

<<<<<<< HEAD
export const addClearMethod = <S extends Storage | StorageWithOptions<any>>(
  storage: Omit<S, "clear">
=======
/**
 * adds a `.clear` method to a Storage without one only using `.key`/`.removeItem`
 */
export const addClearMethod = <S extends Storage | StorageWithOptions<any>>(
  storage: Omit<S, "clear"> & { clear?: () => void }
>>>>>>> 34e82ae1598a3f44a03939374c1417955c02ce82
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
