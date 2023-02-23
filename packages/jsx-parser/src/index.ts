import { Accessor, createMemo, JSX, untrack } from "solid-js";
import type { ResolvedJSXElement, Narrow } from "@solid-primitives/utils";

export type TokenElement<T> = (() => JSX.Element) & { data: T };

// this is only for type inference
declare const TYPE: unique symbol;

export type JSXParser<T> = { readonly id: symbol; [TYPE]: T };

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
): (props: P) => JSX.Element;
export function createToken<T>(
  parser: JSXParser<T>,
  tokenData?: undefined,
  render?: (props: T) => JSX.Element
): (props: T) => JSX.Element;
export function createToken<T>(
  parser: JSXParser<T>,
  tokenData?: (props: T) => T,
  render?: (props: T) => JSX.Element
): (props: T) => JSX.Element {
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

function resolveChildren(
  resolved: unknown[],
  children: unknown,
  symbol: symbol,
  addElements: boolean
): any[] {
  // function
  if (typeof children === "function" && !children.length) {
    if (symbol in children)
      addElements ? resolved.push(children) : resolved.push((children as any).data);
    else resolveChildren(resolved, children(), symbol, addElements);
  }
  // array
  else if (Array.isArray(children))
    for (let i = 0; i < children.length; i++)
      resolveChildren(resolved, children[i], symbol, addElements);
  // other element
  else if (addElements) resolved.push(children);
  else if (process.env.DEV && children)
    // eslint-disable-next-line no-console
    console.warn(`Invalid JSX Element passed to Parser "${symbol.description}":`, children);

  return resolved;
}

/**
 * Resolves all tokens in a JSX Element
 * @param parser object returned by `createJSXParser`
 * @param fn accessor that returns a JSX Element
 * @param addElements if `true`, JSX Elements will be included in the result array (default: `false`)
 * @returns accessor that returns an array of resolved tokens and JSX Elements
 */
export function resolveTokens<T>(
  parser: JSXParser<T>,
  fn: Accessor<JSX.Element>,
  addElements: true
): Accessor<(TokenElement<T> | ResolvedJSXElement)[]>;
export function resolveTokens<T>(
  parser: JSXParser<T>,
  fn: Accessor<JSX.Element>,
  addElements?: boolean
): Accessor<T[]>;
export function resolveTokens<T>(
  parser: JSXParser<T>,
  fn: Accessor<JSX.Element>,
  addElements = false
): Accessor<(TokenElement<T> | ResolvedJSXElement)[] | T[]> {
  const children = createMemo(fn);
  return createMemo(() => resolveChildren([], children(), parser.id, addElements));
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
