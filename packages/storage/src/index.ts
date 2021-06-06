import type { State } from 'solid-js';
import { createSignal } from 'solid-js';

/**
 * Create a new storage primitive that can retain any data type
 * for storage in a browser's LocalStorage or SessionStorage API.
 *
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
 const createStorage = (
  key: string,
  initialValue?: string | number | object,
  engine?: Storage
): [get: State<any>, set: (key: string, value: any) => void] => {
  const storage = !engine ? localStorage : sessionStorage;
  const [value, setValue] = createSignal(
    initialValue || storage.getItem(key) || ""
  );

  // Sets changes to the engine
  const setItem = (value: any) => {
    setValue(value);
    storage.setItem(
      key,
      typeof value === "object" ? JSON.stringify(value) : value
    );
  };

  return [value, setItem];
};

export default createStorage;
