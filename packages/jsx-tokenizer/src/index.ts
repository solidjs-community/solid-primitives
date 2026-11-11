import {
  type Accessor,
  type Component,
  createComponent,
  createMemo,
  DEV,
  type ResolvedElement,
} from "solid-js";
import { isServer, type JSX } from "@solidjs/web";
import type { NoInfer, Many } from "@solid-primitives/utils";
import { asArray } from "@solid-primitives/utils";

/** @internal $TYPE is only used for type inference */
declare const $TYPE: unique symbol;
/** @internal */
const $TOKENIZER: unique symbol = Symbol(!isServer && DEV ? "jsx-tokenizer" : "");

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
export type TokenElement<TData> = JSX.Element & { data: TData; [$TOKENIZER]: symbol };

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
    [$TOKENIZER]: Symbol(!isServer && DEV ? options?.name || "jsx-tokenizer" : ""),
  } as JSXTokenizer<T>;
}

/**
 * Creates a token component for passing custom data through JSX structure.
 * The token component can be used as a normal component in JSX.
 * When resolved by {@link resolveTokens} it will return the data passed to it.
 * But when resolved normally (e.g. using the `children()` helper) it will return the fallback JSX Element.
 *
 * @param tokenizer identity object returned by {@link createTokenizer} or other {@link TokenComponent}. _(If not passed, a new tokenizer id will be created.)_
 * @param tokenData function that returns the data of the token. _(if one isn't passed, props will be used as data)_
 * @param render function that returns the fallback JSX Element to render. _(If not passed, the token will render nothing and warn in development.)_
 * @returns a token component ({@link TokenComponent}) that can be used as a normal component in JSX.
 */
export function createToken<TProps extends object, TData>(
  tokenizer: JSXTokenizer<TData>,
  tokenData: NoInfer<(props: TProps) => TData>,
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
    Symbol(!isServer && DEV ? args[0]?.name || args[1]?.name || "jsx-token" : "");

  const comp = ((props: P) => {
    const token = (args[1]
      ? () => createComponent(args[1], props)
      : () => {
          !isServer &&
            DEV &&
            // oxlint-disable-next-line no-console
            console.warn(
              `Tokens can only be rendered with resolveTokens. ("${symbol.description}")`,
            );
          return "";
        }) as unknown as TokenElement<T>;
    token.data = args[0] ? args[0](props) : props;
    token[$TOKENIZER] = symbol;

    return token as unknown as JSX.Element;
  }) as TokenComponent<P, T>;
  comp[$TOKENIZER] = symbol;

  return comp;
}

/** @internal identifies object tokens created by {@link createObjectToken} without adding properties to them */
const objectTokens: WeakMap<object, symbol> = new WeakMap();

/**
 * Creates an object token component for passing custom data through JSX structure.
 *
 * Works like {@link createToken}, but the token element is a plain object (`{ data }`) instead of a function.
 * Because it is not a function, it survives being resolved by Solid's `children()` helper, context providers,
 * and any other component that resolves its children — so the resolved children can still be parsed with
 * {@link resolveTokens} or {@link isToken}.
 *
 * Object tokens cannot render a fallback. If one ends up being inserted into the DOM, Solid skips it
 * (and warns in development).
 *
 * @param tokenizer identity object returned by {@link createTokenizer} or other {@link TokenComponent}. _(If not passed, a new tokenizer id will be created.)_
 * @param tokenData function that returns the data of the token. _(if one isn't passed, props will be used as data)_
 * @returns a token component ({@link TokenComponent}) that can be used as a normal component in JSX.
 */
export function createObjectToken<TProps extends object, TData>(
  tokenizer: JSXTokenizer<TData>,
  tokenData: NoInfer<(props: TProps) => TData>,
): TokenComponent<TProps, TData>;

export function createObjectToken<TData extends object>(
  tokenizer: JSXTokenizer<TData>,
  tokenData?: undefined,
): TokenComponent<TData>;

export function createObjectToken<TProps extends object, TData>(
  tokenData: (props: TProps) => TData,
): TokenComponent<TProps, TData>;

export function createObjectToken<TData extends object>(
  tokenData?: undefined,
): TokenComponent<TData>;

export function createObjectToken<P extends object, T>(
  ...args: [a?: any, b?: any]
): TokenComponent<P, T> {
  const symbol =
    (args[0]?.[$TOKENIZER] ? (args.shift()[$TOKENIZER] as symbol) : undefined) ??
    Symbol(!isServer && DEV ? args[0]?.name || "jsx-token" : "");

  const comp = ((props: P) => {
    const token = { data: args[0] ? args[0](props) : props };
    objectTokens.set(token, symbol);
    return token as unknown as JSX.Element;
  }) as TokenComponent<P, T>;
  comp[$TOKENIZER] = symbol;

  return comp;
}

/**
 * Returns the tokenizer id of a token, or `undefined` if `value` isn't one.
 * Function tokens carry the id as a property; object tokens are looked up in the `WeakMap`.
 */
function getTokenSymbol(value: unknown): symbol | undefined {
  if (typeof value === "function") return (value as any)[$TOKENIZER];
  if (value !== null && typeof value === "object") return objectTokens.get(value);
  return undefined;
}

/**
 * Walks a JSX value (calling zero-argument functions and descending into arrays) and pushes
 * every token whose tokenizer id is in `symbols` onto `resolved`. When `addElements` is set,
 * non-matching values are pushed as well. Returns `resolved`.
 */
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
  // object token
  else if (value !== null && typeof value === "object" && objectTokens.has(value)) {
    if (addElements || symbols.has(objectTokens.get(value)!)) resolved.push(value);
  }
  // other element
  else if (addElements) resolved.push(value);
  else if (!isServer && DEV && value)
    // oxlint-disable-next-line no-console
    console.warn(`Invalid JSX Element passed to token resolver:`, value);

  return resolved;
}

/**
 * A function similar to Solid's [`children()`](https://www.solidjs.com/docs/latest#children). Resolves passed JSX structure, searching for tokens with the given tokenizer id.
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
): Accessor<(TokenElement<TData> | ResolvedElement)[]>;

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
): Accessor<(TokenElement<JSXTokenizerData<TTokenizers[number]>> | ResolvedElement)[]>;

export function resolveTokens<T>(
  tokenizers: Many<JSXTokenizer<T>>,
  fn: Accessor<JSX.Element>,
  options?: {
    includeJSXElements?: boolean;
  },
): Accessor<(TokenElement<T> | ResolvedElement)[]> {
  const symbols = new Set(asArray(tokenizers).map(p => p[$TOKENIZER]));
  const children = createMemo(fn);
  return createMemo(() => getResolvedTokens([], children(), symbols, options?.includeJSXElements));
}

/**
 * Checks if passed value is a {@link TokenElement} created by the corresponding jsx-tokenizer.
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
  const symbol = getTokenSymbol(value);
  if (!symbol) return false;
  return Array.isArray(parsers)
    ? parsers.some(p => p[$TOKENIZER] === symbol)
    : parsers[$TOKENIZER] === symbol;
}
