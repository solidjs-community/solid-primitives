import { Accessor, Component, createComponent, createMemo, JSX } from "solid-js";
import type { ResolvedJSXElement, Narrow, Many } from "@solid-primitives/utils";
import { asArray } from "@solid-primitives/utils";

/** @internal $TYPE is only used for type inference */
declare const $TYPE: unique symbol;
/** @internal */
const $TOKENIZER = Symbol(process.env.DEV ? "jsx-tokenizer" : "");

/**
 * Identifies a JSX Tokenizer. It is returned by {@link createTokenizer} (or {@link createToken}) and used by {@link createToken} and {@link resolveTokens}.
 */
export type JSXTokenizer<TData> = { [$TOKENIZER]: symbol; [$TYPE]: TData };

/**
 * Infer the data type of a {@link JSXTokenizer}
 */
export type JSXTokenizerData<TParser extends JSXTokenizer<any>> = TParser[typeof $TYPE];

/**
 * Type of the element returned by {@link TokenComponent} and {@link resolveTokens}.
 */
export type TokenElement<TData> = (() => JSX.Element) & { data: TData; [$TOKENIZER]: symbol };

/**
 * Type of the component returned by {@link createToken}.
 */
export type TokenComponent<TProps extends object, TData = TProps> = Component<TProps> &
  JSXTokenizer<TData>;

/**
 * Creates a JSX Tokenizer that can be used to create multiple token components with the same id and resolve their data from the JSX Element structure.
 *
 * @param options - Additional options for the parser
 * @param options.name - The name of the parser, used for debugging
 * @returns tokenizer identity object required by `createToken`, `resolveTokens` and `isToken` functions.
 * @example
 * ```tsx
 * const Tokenizer = createTokenizer();
 *
 * const MyTokenA = createToken(Tokenizer, props => ({ type: "A" }));
 *
 * const MyTokenB = createToken(Tokenizer, props => ({ type: "B" }));
 *
 * const MyComponent = props => {
 *   const tokens = resolveTokens(Tokenizer, () => props.children);
 *   return <ul>
 *     <For each={tokens()}>{token => <li>{token.data.type}</li>}</For>
 *   </ul>
 * }
 *
 * <MyComponent>
 *   <MyTokenA/>
 *   <MyTokenB/>
 * </MyComponent>
 * ```
 */
export function createTokenizer<T>(options?: { name: string }): JSXTokenizer<T> {
  return {
    [$TOKENIZER]: Symbol(process.env.DEV ? options?.name || "jsx-tokenizer" : ""),
  } as JSXTokenizer<T>;
}

/**
 * Creates a token component for passing custom data through JSX structure.
 * The token component can be used as a normal component in JSX.
 * When resolved by {@link resolveTokens} it will return the data passed to it.
 * But when resolved normally (e.g. using the `children()` helper) it will return the fallback JSX Element.
 *
 * @param tokenizer identity object returned by {@link createTokenizer} or other {@link TokenComponent}. If not passed, a new tokenizer id will be created.
 * @param tokenData function that returns the data of the token. If not passed, the props will be used as the data.
 * @param render function that returns the fallback JSX Element to render. If not passed, the token will render nothing and warn in development.
 * @returns a token component ({@link TokenComponent}) that can be used as a normal component in JSX.
 */
export function createToken<TProps extends object, TData extends TDataUnion, TDataUnion>(
  tokenizer: JSXTokenizer<TDataUnion>,
  tokenData: (props: TProps) => Narrow<TData>,
  render?: (props: TProps) => JSX.Element,
): TokenComponent<TProps, TData>;

export function createToken<TData extends object>(
  tokenizer: JSXTokenizer<TData>,
  tokenData?: undefined,
  render?: (props: TData) => JSX.Element,
): TokenComponent<TData>;

export function createToken<TProps extends object, TData>(
  tokenData: (props: TProps) => TData,
  render?: (props: TProps) => JSX.Element,
): TokenComponent<TProps, TData>;

export function createToken<TData extends object>(
  tokenData?: undefined,
  render?: (props: TData) => JSX.Element,
): TokenComponent<TData>;

export function createToken<P extends object, T>(
  ...args: [a?: any, b?: any, c?: any]
): TokenComponent<P, T> {
  const symbol =
    (args[0]?.[$TOKENIZER] ? (args.shift()[$TOKENIZER] as symbol) : undefined) ??
    Symbol(process.env.DEV ? args[0]?.name || args[1]?.name || "jsx-token" : "");

  const comp = ((props: P) => {
    const token = (
      args[1]
        ? () => createComponent(args[1], props)
        : () => {
            process.env.DEV &&
              // eslint-disable-next-line no-console
              console.warn(
                `Tokens can only be rendered with resolveTokens. ("${symbol.description}")`,
              );
            return "";
          }
    ) as TokenElement<T>;
    token.data = args[0] ? args[0](props) : props;
    token[$TOKENIZER] = symbol;

    return token as JSX.Element;
  }) as TokenComponent<P, T>;
  comp[$TOKENIZER] = symbol;

  return comp;
}

function getResolvedTokens(
  resolved: unknown[],
  value: unknown,
  symbols: ReadonlySet<symbol>,
  addElements: boolean | undefined,
): any[] {
  // function
  if (typeof value === "function" && !value.length) {
    if (symbols.has((value as any)[$TOKENIZER])) resolved.push(value);
    else getResolvedTokens(resolved, value(), symbols, addElements);
  }
  // array
  else if (Array.isArray(value))
    for (let i = 0; i < value.length; i++)
      getResolvedTokens(resolved, value[i], symbols, addElements);
  // other element
  else if (addElements) resolved.push(value);
  else if (process.env.DEV && value)
    // eslint-disable-next-line no-console
    console.warn(`Invalid JSX Element passed to token resolver:`, value);

  return resolved;
}

/**
 * Resolves all tokens in a JSX Element structure.
 * @param tokenizer identity object returned by {@link createTokenizer} or a {@link TokenComponent}. An array of multiple tokenizers can be passed.
 * @param fn accessor that returns a JSX Element structure (e.g. `() => props.children`)
 * @param options options for the resolver
 * - `includeJSXElements` - if `true`, other JSX Elements will be included in the result array (default: `false`)
 * @returns accessor that returns an array of resolved tokens and JSX Elements
 */
export function resolveTokens<TData>(
  tokenizer: JSXTokenizer<TData>,
  fn: Accessor<JSX.Element>,
  options?: {
    includeJSXElements?: false;
  },
): Accessor<TokenElement<TData>[]>;

export function resolveTokens<TData>(
  tokenizer: JSXTokenizer<TData>,
  fn: Accessor<JSX.Element>,
  options: {
    includeJSXElements: true;
  },
): Accessor<(TokenElement<TData> | ResolvedJSXElement)[]>;

export function resolveTokens<TTokenizers extends readonly JSXTokenizer<any>[]>(
  tokenizers: TTokenizers,
  fn: Accessor<JSX.Element>,
  options?: {
    includeJSXElements?: false;
  },
): Accessor<TokenElement<JSXTokenizerData<TTokenizers[number]>>[]>;

export function resolveTokens<TTokenizers extends readonly JSXTokenizer<any>[]>(
  tokenizers: TTokenizers,
  fn: Accessor<JSX.Element>,
  options: {
    includeJSXElements: true;
  },
): Accessor<(TokenElement<JSXTokenizerData<TTokenizers[number]>> | ResolvedJSXElement)[]>;

export function resolveTokens<T>(
  tokenizers: Many<JSXTokenizer<T>>,
  fn: Accessor<JSX.Element>,
  options?: {
    includeJSXElements?: boolean;
  },
): Accessor<(TokenElement<T> | ResolvedJSXElement)[]> {
  const symbols = new Set(asArray(tokenizers).map(p => p[$TOKENIZER]));
  const children = createMemo(fn);
  return createMemo(() => getResolvedTokens([], children(), symbols, options?.includeJSXElements));
}

/**
 * Checks if a value is a token {@link TokenElement}
 * @param tokenizer identity object returned by {@link createTokenizer} or a {@link TokenComponent}. An array of multiple tokenizers can be passed.
 * @param value value to check
 * @returns true if value is a {@link TokenElement}
 */
export function isToken<TData>(
  tokenizer: JSXTokenizer<TData>,
  value: unknown | TokenElement<TData>,
): value is TokenElement<TData>;

export function isToken<TTokenizers extends readonly JSXTokenizer<any>[]>(
  tokenizers: TTokenizers,
  value: unknown | TokenElement<JSXTokenizerData<TTokenizers[number]>>,
): value is TokenElement<JSXTokenizerData<TTokenizers[number]>>;

export function isToken<T>(
  parsers: Many<JSXTokenizer<T>>,
  value: unknown | TokenElement<T>,
): value is TokenElement<T> {
  if (typeof value !== "function" || !($TOKENIZER in value)) return false;
  const symbol = value[$TOKENIZER];
  return Array.isArray(parsers)
    ? parsers.some(p => p[$TOKENIZER] === symbol)
    : parsers[$TOKENIZER] === symbol;
}
