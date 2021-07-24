import { createSignal, getListener } from "solid-js";

/**
 * Create a new storage primitive that can retain any data type
 * with an interface compatible with the Web Storage API.
 *
 * @param prefix - Prefix to wrap all stored values with.
 * @param storage - Storage engine to use for recording the value
 * @return Returns a state reader, setter and clear function
 *
 * @example
 * ```ts
 * const [value, setValue] = createStorage('app');
 * setValue('My new value');
 * console.log(value());
 * ```
 */
function createLocalStore<T>(
  prefix: string | null = null,
  storage: Storage = localStorage
): [
  store: T,
  setter: (key: string, value: string | number) => void,
  remove: (key: string) => void,
  clear: () => void
] {
  const signals = new Map();
  const propPrefix = prefix === null ? "" : `${prefix}.`;
  return [
    new Proxy(
      {},
      {
        get(_, key: string) {
          if (getListener()) {
            let node = signals.get(key);
            if (!node) {
              // @ts-ignore
              node = createSignal(undefined, { equals: false });
              signals.set(key, node);
            }
            node[0]();
          }
          return storage.getItem(`${propPrefix}${key}`);
        }
      }
    ) as T,
    (key, value) => {
      storage.setItem(`${propPrefix}${key}`, value.toString());
      const node = signals.get(key);
      node && node[1]();
    },
    key => {
      storage.removeItem(`${propPrefix}${key}`);
      const node = signals.get(key);
      node && node[1]();
    },
    () => {
      storage.clear();
      signals.clear();
    }
  ];
}

export default createLocalStore;
