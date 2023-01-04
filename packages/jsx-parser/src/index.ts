import { JSXElement, createMemo } from "solid-js";

export function createJSXParser(id: string = "solid-parser") {
  const $TOKEN = Symbol(id);

  function createToken<
    TProps extends { [key: string]: any },
    TToken extends { [key: string]: any } & { id: string }
  >(
    tokenProperties: (props: TProps) => TToken,
    component?: (props: TProps) => JSXElement
  ): (props: TToken["props"]) => JSXElement {
    return (props: TProps) => {
      return Object.assign(
        component
          ? () => component(props)
          : () => {
              process.env.DEV &&
                console.info(`tokens can only be rendered inside a Parser with id '${id}'`);
              return "";
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
        ? (([] as any[]).concat(children()).filter(child => child && $TOKEN in child) as T[])
        : []
    );
  }

  return { createToken, childrenTokens, $TOKEN };
}
