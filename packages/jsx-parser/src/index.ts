import { Accessor, createMemo, JSX, untrack } from "solid-js";
import { type Narrow } from "@solid-primitives/utils";

export type TokenElement<T> = (() => JSX.Element) & { data: T };

// this is only for type inference
declare const TYPE: unique symbol;

export type JSXParser<T> = { readonly id: symbol } & { [k in typeof TYPE]: T };

export type JSXParserData<T extends JSXParser<any>> = T[typeof TYPE];

/**
 * Creates a JSX Parser that can be used to create tokenized components and parse JSX Elements for tokens.
 *
 * @param options - Additional options for the parser
 * @param options.name - The name of the parser, used for debugging
 * @returns parser object required by `createToken`, `childrenTokens` and `isToken` functions.
 * @example
 * ```tsx
 * const parser = createJSXParser();
 *
 * const MyToken = createToken(parser, props => ({ type: "my-token", props }));
 *
 * const MyComponent = props => {
 *   const tokens = resolveTokens(parser, () => props.children);
 *   return <ul>
 *     <For each={tokens()}>{token => <li>{token.data.type}</li>}</For>
 *   </ul>
 * }
 *
 * <MyComponent>
 *   <MyToken/>
 *   <MyToken/>
 * </MyComponent>
 * ```
 */
export function createJSXParser<T>(options?: { name: string }): JSXParser<T> {
  return { id: Symbol(process.env.DEV ? options?.name || "jsx-parser" : "") } as any;
}

/**
 * Creates a token component associated with the corresponding jsx-parser.
 * @param parser object returned by `createJSXParser`
 * @param tokenData function that returns the data of the token
 * @param render function that returns the fallback JSX Element to render
 * @returns a token component
 */
export function createToken<P extends { [key: string]: any }, T extends Tokens, Tokens>(
  parser: JSXParser<Tokens>,
  tokenData: (props: P) => Narrow<T>,
  render?: (props: P) => JSX.Element
): (props: P) => TokenElement<T>;
export function createToken<T>(
  parser: JSXParser<T>,
  tokenData?: undefined,
  render?: (props: T) => JSX.Element
): (props: T) => TokenElement<T>;
export function createToken<T>(
  parser: JSXParser<T>,
  tokenData?: (props: T) => T,
  render?: (props: T) => JSX.Element
): (props: T) => TokenElement<T> {
  return (props: T) => {
    const token = (
      render
        ? () => untrack(() => render(props))
        : () => {
            process.env.DEV &&
              // eslint-disable-next-line no-console
              console.warn(
                `Tokens can only be rendered inside a Parser "${parser.id.description}"`
              );
            return "";
          }
    ) as TokenElement<T>;
    (token as any)[parser.id] = true;
    token.data = tokenData ? tokenData(props) : props;
    return token;
  };
}

function resolveChildren(resolved: unknown[], children: unknown, symbol: symbol): any[] {
  if (typeof children === "function" && !children.length) {
    if (symbol in children) resolved.push(children);
    else resolveChildren(resolved, children(), symbol);
  } else if (Array.isArray(children))
    for (let i = 0; i < children.length; i++) resolveChildren(resolved, children[i], symbol);
  else if (process.env.DEV)
    // eslint-disable-next-line no-console
    console.warn(`Invalid JSX Element passed to Parser "${symbol.description}":`, children);
  return resolved;
}

/**
 * Resolves all tokens in a JSX Element
 * @param parser object returned by `createJSXParser`
 * @param fn accessor that returns a JSX Element
 * @returns accessor that returns an array of tokens
 */
export function resolveTokens<T>(
  parser: JSXParser<T>,
  fn: Accessor<JSX.Element>
): Accessor<TokenElement<T>[]> {
  const children = createMemo(fn);
  return createMemo(() => resolveChildren([], children(), parser.id));
}

/**
 * Resolves all tokens in a JSX Element and returns the data of the tokens
 * @param parser object returned by `createJSXParser`
 * @param fn accessor that returns a JSX Element
 * @returns accessor that returns an array of token data
 */
export function resolveData<T>(parser: JSXParser<T>, fn: Accessor<JSX.Element>): Accessor<T[]> {
  const tokens = resolveTokens(parser, fn);
  return () => tokens().map(token => token.data);
}

/**
 * Checks if a value is a token
 * @param parser object returned by `createJSXParser`
 * @param value value to check
 * @returns true if value is a token
 */
export function isToken<T>(
  parser: JSXParser<T>,
  value: unknown | TokenElement<T>
): value is TokenElement<T> {
  return typeof value === "function" && parser.id in value;
}
