/**
 * Create a new subset props object by **omitting unwanted keys** from the source props.
 * @param props source props object
 * @param keys property names of {@link props} to omit
 * @returns new reactive props object with selected {@link keys} removed
 * @example
 * ```tsx
 * const attrs = omitProps({ count: number, selected: boolean, class?: string }, "count", "selected")
 * <div {...attrs}>Hello!</div>
 * ```
 */
export function omitProps<T extends Record<string, unknown>, K extends keyof T>(
  props: T,
  ...keys: K[]
): Omit<T, K> {
  const newProps = {} as Omit<T, K>;
  for (const key in props) {
    if (keys.includes(key as any)) continue;
    Object.defineProperty(newProps, key, Object.getOwnPropertyDescriptor(props, key)!);
  }
  return newProps;
}

/**
 * Create a new subset props object by **selecting only specified keys** from the source props.
 * @param props source props object
 * @param keys property names of {@link props} to include in returned object
 * @returns new reactive props object with selected {@link keys}
 * @example
 * ```tsx
 * const attrs = pickProps({ count: number, checked: boolean, class?: string }, "class", "checked")
 * <input type="checkbox" {...attrs}/>
 * ```
 */
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
