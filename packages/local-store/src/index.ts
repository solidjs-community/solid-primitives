import { createSignal, getListener } from "solid-js";

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
function createLocalStore<T>(
  prefix: string | null = null,
  storage: Storage = localStorage
): [
  store: T,
  setter: (key: string, value: string|Number) => void
] {
  const signals = new Map();
  const propPrefix = prefix === null ? '' : `${prefix}.`;
  return [
    new Proxy({}, {
      get(_, prop: string) {
        if (getListener()) {
          let node = signals.get(prop);
          if (!node) {
            node = createSignal(undefined, { equals: false });
            signals.set(prop, node);
          }
          node[0]();
        }
        return storage.getItem(`${propPrefix}${prop}`);
      }
    }) as T,
    (prop, value) => {
      storage.setItem(`${propPrefix}${prop}`, value.toString());
      const node = signals.get(prop);
      node && node[1]();
    }
  ]
}

export default createLocalStore;
