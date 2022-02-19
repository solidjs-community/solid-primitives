import { Component } from "solid-js";
import { createContextProvider } from "./factory";

export type CreateContextProvider = <T, P extends Record<string, any>>(
  factoryFn: (props: P) => T
) => [provider: Component<P>, useContext: () => T | undefined];

export { createContextProvider };
