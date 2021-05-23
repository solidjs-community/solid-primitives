import { createEffect, createSignal } from 'solid-js';

export default function createLocalStorage(
  key: string,
  initialValue: string = ''
): [get: () => String | undefined, set: (value: string) => void] {
  const [value, setValue] = createSignal<string>(
    window.localStorage.getItem(key) || initialValue
  );

  const setItem = (newValue: string) => {
    setValue(newValue);
    window.localStorage.setItem(key, newValue);
  };

  createEffect(() => {
    const newValue = window.localStorage.getItem(key);
    if (value() !== newValue) {
      setValue(newValue || initialValue);
    }
  });

  const handleStorage = (event: StorageEvent) => {
    if (event.key === key && event.newValue !== value()) {
      setValue(event.newValue || initialValue);
    }
  };

  createEffect(() => {
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  });

  return [value, setItem];
}
