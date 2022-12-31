import { JSXElement, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";

const $TOKEN = Symbol("solid-parser");

export type Token<T, U> = {
  props: T;
  meta: U;
  component: (props: any) => JSXElement;
  callback: () => any;
};

export function tokenize<T>(
  callback: (props: T) => any,
  meta?: { [key: string]: any },
  component?: (props: T) => JSXElement
): (props: T) => JSXElement {
  return (props: any) => {
    return Object.assign(
      () => {
        if (!component)
          console.info(
            "only Tokens tokenized with a component-parameter can be renderered outside a Parser"
          );
        return <Dynamic {...props} component={component ? component : () => <></>} />;
      },
      {
        props,
        [$TOKEN]: true,
        meta,
        callback: () => callback(props)
      }
    );
  };
}

export function childrenTokens<T>(children: () => JSXElement | JSXElement[] | T | T[]) {
  return createMemo(() =>
    children
      ? ([] as any[])
          .concat(children())
          .filter(child => child && $TOKEN in child)
          .map((a: T) => a as T)
      : []
  );
}
