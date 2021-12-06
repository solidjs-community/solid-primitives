import { Fn } from "@solid-primitives/utils";

export const createCallbackStack = () => {
  let stack: Fn[] = [];
  const push = (callback: Fn) => stack.push(callback);
  const execute = () => {
    stack.forEach(cb => cb());
    stack = [];
  };
  return {
    push,
    execute
  };
};
