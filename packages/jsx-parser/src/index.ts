import { JSXElement, createMemo } from "solid-js";

export function createJSXParser<TTokens = {}>(id: string = "solid-parser") {
  const $TOKEN = Symbol(id);

  function createToken<TProps extends { [key: string]: any }, TToken extends TTokens>(
    tokenProperties: (props: TProps) => TToken,
    component?: (props: TProps) => JSXElement
  ): (props: TProps) => JSXElement {
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

  function childrenTokens(children: () => JSXElement | JSXElement[]): () => TTokens[] {
    return createMemo(() =>
      children
        ? (([] as any[]).concat(children()).filter(child => child && $TOKEN in child) as TTokens[])
        : []
    );
  }

  return { createToken, childrenTokens, $TOKEN };
}
