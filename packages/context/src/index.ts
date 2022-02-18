import { Component } from "solid-js";
import { createContextProvider } from "./factory";

export type CreateContextProvider = <T, P extends Record<string, any>>(
  factoryFn: (props: P) => T
) => [provider: Component<P>, useContext: () => T | undefined];

export type CreateDefiniteContextProvider = <T, P extends Record<string, any>>(
  factoryFn: (props: P) => T
) => [provider: Component<P>, useContext: () => T];

export const definite = <T>(v: T) => v as NonNullable<T>;

export const createDefiniteContextProvider = createContextProvider as CreateDefiniteContextProvider;
export { createContextProvider };
