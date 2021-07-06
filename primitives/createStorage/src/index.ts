import { onMount, createSignal, onCleanup } from 'solid-js';

/**
 * Create a new storage primitive that can retain any data type
 * for storage in a browser's LocalStorage or SessionStorage API.
 *
 * @param key - Key to store the value as
 * @param initialValue - Starting value of the storage
 * @param engine - Storage engine to use for recording the value
 * @return Returns a state reader and setter function
 * 
 * @example
 * ```ts
 * const [value, setValue] = createStorage('my-key');
 * setValue('my-new-value');
 * console.log(value());
 * ```
 */
 const createStorage = <T>(
  key: string,
  initialValue?: T,
  engine?: Storage,
  listenChange = false
): [get: () => T | string | null, set: (value: T) => void] => {
  const storage = !engine ? localStorage : sessionStorage;
  const [value, setValue] = createSignal(
    initialValue || storage.getItem(key)
  );

  // Sets changes to the engine
  const setItem = (value: T) => {
    try {
      storage.setItem(key, JSON.stringify(value));
      setValue(value);
    } catch(err) {
      throw new Error("Could not save value to storage");
    }
  };

  // Conditional handler to listen for changes
  if (listenChange) {
    const handleStorageChange = () => setValue(storage.getItem(key));
    onMount(() => globalThis.addEventListener('storage', handleStorageChange));
    onCleanup(() => globalThis.removeEventListener('storage', handleStorageChange));
  }

  return [value, setItem];
};

export default createStorage;
