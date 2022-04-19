import clsx from "clsx";
import { mergeProps } from "solid-js";

import { chainHandlers } from "./handler";

interface Props {
  [key: string]: any;
}

// taken from: https://stackoverflow.com/questions/51603250/typescript-3-parameter-list-intersection-type/51604379#51604379
type TupleTypes<T> = { [P in keyof T]: T[P] } extends { [key: number]: infer V } ? V : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;

/**
 * A reactive object combine method.
 * Combine multiple props objects together.
 * Event handlers are chained and classNames are combined.
 * For all other props, the last prop object overrides all previous ones.
 * @param args - Multiple sets of props to combine together.
 */
export function combineProps<T extends Props[]>(...args: T): UnionToIntersection<TupleTypes<T>> {
  // Start with a base clone of the first argument. This is a lot faster than starting
  // with an empty object and adding properties as we go.
  let combinedProps: Props = mergeProps(args[0]);

  for (let i = 1; i < args.length; i++) {
    const nextProps = args[i];

    for (const key in nextProps) {
      // eslint-disable-next-line solid/reactivity
      const a = combinedProps[key];
      const b = nextProps[key];

      // Chain events
      if (
        typeof a === "function" &&
        typeof b === "function" &&
        // This is a lot faster than a regex.
        key[0] === "o" &&
        key[1] === "n" &&
        key.charCodeAt(2) >= /* 'A' */ 65 &&
        key.charCodeAt(2) <= /* 'Z' */ 90
      ) {
        // eslint-disable-next-line solid/reactivity
        combinedProps = mergeProps(combinedProps, { [key]: chainHandlers(a, b) });

        // Merge classes, sometimes classes are empty string which eval to false, so we just need to do a type check
      } else if (key === "class" && typeof a === "string" && typeof b === "string") {
        // eslint-disable-next-line solid/reactivity
        combinedProps = mergeProps(combinedProps, { [key]: clsx(a, b) });
      } else {
        // eslint-disable-next-line solid/reactivity
        combinedProps = mergeProps(combinedProps, { [key]: b !== undefined ? b : a });
      }
    }
  }

  return combinedProps as UnionToIntersection<TupleTypes<T>>;
}
