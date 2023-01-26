import { Accessor, createMemo, JSX, untrack } from "solid-js";

function resolveChildren(children: unknown, symbol: symbol): unknown {
  if (typeof children === "function" && !children.length)
    return symbol in children ? children : resolveChildren(children(), symbol);
  if (Array.isArray(children)) {
    const results: unknown[] = [];
    for (let i = 0; i < children.length; i++) {
      const result = resolveChildren(children[i], symbol);
      Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return children;
}

export function createJSXParser<Tokens extends {}>(options?: { name: string }) {
  const name = options?.name || process.env.DEV ? "jsx-parser" : "";
  const id = Symbol(name);

  function createToken<Props extends { [key: string]: any }, Token extends Tokens>(
    tokenCallback: (props: Props) => Token,
    component?: (props: Props) => JSX.Element
  ): (props: Props) => JSX.Element {
    return (props: Props) =>
      Object.assign(
        component
          ? () => untrack(() => component(props))
          : () => {
              process.env.DEV &&
                // eslint-disable-next-line no-console
                console.warn(`tokens can only be rendered inside a Parser with id '${name}'`);
              return "";
            },
        {
          [id]: true,
          ...tokenCallback(props)
        }
      );
  }

  function childrenTokens(fn: Accessor<JSX.Element>): Accessor<Tokens[]> {
    const children = createMemo(fn);
    return createMemo(() => {
      const resolvedChildren = resolveChildren(children(), id);
      return Array.isArray(resolvedChildren) ? resolvedChildren : [resolvedChildren];
    });
  }

  function isToken(value: unknown | Tokens): value is Tokens {
    return typeof value === "function" && !value.length && id in value;
  }

  return { createToken, childrenTokens, isToken, id };
}
