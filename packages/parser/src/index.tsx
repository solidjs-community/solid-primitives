import { JSXElement, createMemo } from "solid-js";

export function createParser(id?: string) {
  const $TOKEN = Symbol(id || "solid-parser");

  function tokenize<
    TToken extends Meta & {
      props: unknown;
    }
  >(meta: Omit<TToken, "props">): (props: TToken["props"]) => JSXElement {
    return (props: any) => {
      return Object.assign(
        () => {
          console.info("tokens can only be rendered inside a Parser");
          return <></>;
        },
        {
          [$TOKEN]: true,
          ...meta,
          props
        }
      );
    };
  }

  function childrenTokens<T>(children: () => JSXElement | JSXElement[] | T | T[]) {
    return createMemo(() =>
      children
        ? ([] as any[])
            .concat(children())
            .filter(child => child && $TOKEN in child)
            .map((a: T) => a as T)
        : []
    );
  }

  return { tokenize, childrenTokens, $TOKEN };
}
type Meta = { [key: string]: any; id: string };

export type Token<TProps, TMeta extends Meta> = TMeta & {
  props: TProps;
};
