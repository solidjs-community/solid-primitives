import { Accessor, Setter, createSignal, JSX } from "solid-js";
import { isServer } from "solid-js/web";

/**
 * A template example of how to create a new primitive.
 *
 * @param param An example of an introductory parameter
 * @return Returns the same parameter as an accessor
 */
export const createPrimitiveTemplate = (
  param: boolean,
): [get: Accessor<boolean>, set: Setter<boolean>] => {
  if (isServer) {
    return [() => param, () => undefined];
  }

  const [value, setValue] = createSignal(param);
  return [value, setValue];
};

// While making primitives, there are many patterns in our arsenal
// There are functions like one above, but we also can use components, directives, element properties, etc.
// Solid's tutorial on directives: https://www.solidjs.com/tutorial/bindings_directives
// Example package that uses directives: https://github.com/solidjs-community/solid-primitives/tree/main/packages/intersection-observer
// Example use of components: https://github.com/solidjs-community/solid-primitives/blob/main/packages/event-listener/src/components.ts

// This is how you would declare types for a directive:
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // these are the props accessable in the second function argument:
      myDirective: true | [string, number];
    }
  }
}
// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
