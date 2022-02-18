import { Component, createContext, useContext } from "solid-js";
import { CreateContextProvider } from ".";

export const createContextProvider: CreateContextProvider = factoryFn => {
  const ctx = createContext<any>();
  const Provider: Component<any> = props => {
    const state = factoryFn(props);
    return <ctx.Provider value={state}>{props.children}</ctx.Provider>;
  };
  const useProvider = () => useContext(ctx);
  return [Provider, useProvider];
};
