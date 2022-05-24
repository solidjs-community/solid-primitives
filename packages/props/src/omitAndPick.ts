export function omitProps<T extends Record<string, unknown>, K extends keyof T>(
  props: T,
  ...keys: K[]
): Omit<T, K> {
  const newProps = {} as Omit<T, K>;
  for (const key in props) {
    if (keys.includes(key as any)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(props, key);
    descriptor && Object.defineProperty(newProps, key, descriptor);
  }
  return newProps;
}

export function pickProps<T extends Record<string, unknown>, K extends keyof T>(
  props: T,
  ...keys: K[]
): Pick<T, K> {
  const newProps = {} as Pick<T, K>;
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(props, key);
    descriptor && Object.defineProperty(newProps, key, descriptor);
  }
  return newProps;
}
