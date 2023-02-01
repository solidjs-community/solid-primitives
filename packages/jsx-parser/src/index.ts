import { Accessor, createMemo, JSX, untrack } from "solid-js";

function resolveChildren(resolved: unknown[], children: unknown, symbol: symbol): void {
  if (typeof children === "function" && !children.length) {
    if (symbol in children) resolved.push(children);
    else resolveChildren(resolved, children(), symbol);
  }
  if (Array.isArray(children))
    for (let i = 0; i < children.length; i++) resolveChildren(resolved, children[i], symbol);
}

export type TokenElement<T> = (() => JSX.Element) & { data: T };

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
 *  return <ul>{tokens().map(token => <li>{token.data.type}</li>)}</ul>;
 * }
 *
 * <MyComponent>
 *   <MyToken/>
 *   <MyToken/>
 * </MyComponent>
 * ```
 */
export function createJSXParser<Tokens>(options?: { name: string }) {
  const name = options?.name || process.env.DEV ? "jsx-parser" : "";
  const id = Symbol(name);

  function createToken<P extends { [key: string]: any }, T extends Tokens>(
    tokenData: (props: P) => T,
    render?: (props: P) => JSX.Element
  ): (props: P) => TokenElement<T>;
  function createToken<P extends Tokens>(
    tokenData?: undefined,
    render?: (props: P) => JSX.Element
  ): (props: P) => TokenElement<P>;
  function createToken<P extends { [key: string]: any }, T extends Tokens>(
    tokenData?: (props: P) => T,
    render?: (props: P) => JSX.Element
  ): (props: P) => TokenElement<T> {
    return (props: P) => {
      const token = (
        render
          ? () => untrack(() => render(props))
          : () => {
              process.env.DEV &&
                // eslint-disable-next-line no-console
                console.warn(`tokens can only be rendered inside a Parser with id '${name}'`);
              return "";
            }
      ) as TokenElement<T>;
      (token as any)[id] = true;
      token.data = tokenData ? tokenData(props) : (props as any);
      return token;
    };
  }

  function childrenTokens(fn: Accessor<JSX.Element>): Accessor<TokenElement<Tokens>[]> {
    const children = createMemo(fn);
    return createMemo(() => {
      const tokens: TokenElement<Tokens>[] = [];
      resolveChildren(tokens, children(), id);
      return tokens;
    });
  }

  function isToken(value: unknown | TokenElement<Tokens>): value is TokenElement<Tokens> {
    return typeof value === "function" && !value.length && id in value;
  }

  return { createToken, childrenTokens, isToken, id };
}
