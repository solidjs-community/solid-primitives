import { JSXElement, createMemo } from "solid-js";

export function createParser(id?: string) {
  const $TOKEN = Symbol(id || "solid-parser");

  function tokenize<
    TProps extends { [key: string]: any },
    TToken extends { [key: string]: any } & { id: string }
  >(tokenProperties: (props: TProps) => TToken): (props: TToken["props"]) => JSXElement {
    return (props: any) => {
      return Object.assign(
        () => {
          console.info("tokens can only be rendered inside a Parser");
          return <></>;
        },
        {
          [$TOKEN]: true,
          ...tokenProperties(props)
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
