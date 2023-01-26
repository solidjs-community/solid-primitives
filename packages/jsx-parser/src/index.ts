import { Accessor, createMemo, JSX, untrack } from "solid-js";

function resolveChildren(resolved: unknown[], children: unknown, symbol: symbol): void {
  if (typeof children === "function" && !children.length) {
    if (symbol in children) resolved.push(children);
    else resolveChildren(resolved, children(), symbol);
  }
  if (Array.isArray(children))
    for (let i = 0; i < children.length; i++) resolveChildren(resolved, children[i], symbol);
}

export type TokenComponent<T extends {}> = (() => JSX.Element) & T;

/**
 * Provides the tools to create tokenized components, parse and identify tokens in JSX Elements.
 *
 * @param options - Additional options for the parser
 * @param options.name - The name of the parser, used for debugging
 * @returns functions `createToken`, `childrenTokens`, `isToken` and the symbol associated with the jsx-parser `id`.
 * @example
 * ```tsx
 * const { createToken, childrenTokens } = createJSXParser();
 *
 * const MyToken = createToken(props => ({ type: "my-token", props }));
 *
 * const MyComponent = (props) => {
 *  const tokens = childrenTokens(() => props.children);
 *  return <ul>{tokens().map(token => <li>token.type</li>)}</ul>;
 * }
 *
 * <MyComponent>
 *   <MyToken/>
 *   <MyToken/>
 * </MyComponent>
 * ```
 */
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

  function childrenTokens(fn: Accessor<JSX.Element>) {
    const children = createMemo(fn);
    return createMemo(() => {
      const tokens: TokenComponent<Tokens>[] = [];
      resolveChildren(tokens, children(), id);
      return tokens;
    });
  }

  function isToken(value: unknown | TokenComponent<Tokens>): value is TokenComponent<Tokens> {
    return typeof value === "function" && !value.length && id in value;
  }

  return { createToken, childrenTokens, isToken, id };
}
