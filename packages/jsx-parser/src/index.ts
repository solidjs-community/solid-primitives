import { Accessor, createMemo, JSXElement } from "solid-js";

export function createJSXParser<TTokens extends {}>(id: string = "solid-parser") {
  const $TOKEN = Symbol(id);

  function createToken<TProps extends { [key: string]: any }, TToken extends TTokens>(
    tokenCallback: (props: TProps) => TToken,
    component?: (props: TProps) => JSXElement
  ): (props: TProps) => JSXElement {
    return (props: TProps) => {
      const token = Object.assign(
        component
          ? () => component(props)
          : () => {
              process.env.DEV &&
                console.info(`tokens can only be rendered inside a Parser with id '${id}'`);
              return "";
            },
        {
          [$TOKEN]: true,
          ...tokenCallback(props)
        }
      );
      return token;
    };
  }

  function childrenTokens(fn: Accessor<JSXElement | JSXElement[]>): Accessor<TTokens[]> {
    const children = createMemo(fn);
    const resolveChild = (child: any): any => {
      while (true) {
        if (Array.isArray(child)) return child.map(resolveChild).flat();
        if (typeof child !== "function") return child;
        if ($TOKEN in child) return child;
        child = child();
      }
    };
    return createMemo(() =>
      ([] as any[])
        .concat(children())
        .map(resolveChild)
        .flat()
        .filter(child => child && $TOKEN in child)
    );
  }

  function isToken(value: any) {
    return typeof value === "function" && $TOKEN in value && (value as TTokens);
  }

  return { createToken, childrenTokens, isToken, $TOKEN };
}
