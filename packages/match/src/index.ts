import { type Accessor, type JSX, createMemo } from "solid-js"

/**
 * Control-flow component for matching discriminated union (tagged union) members.
 * 
 * @example
 * ```tsx
 * type MyUnion = {
 *   type: 'foo',
 *   foo:  'foo-value',
 * } | {
 *   type: 'bar',
 *   bar:  'bar-value',
 * }
 * 
 * const [value, setValue] = createSignal<MyUnion>({type: 'foo', foo: 'foo-value'})
 * 
 * <Match on={value()} case={{
 *   foo: v => <>{v().foo}</>,
 *   bar: v => <>{v().bar}</>,
 * }} />
 * ```
 */
export function Match<
	T extends {[k in Tag]: PropertyKey},
	Tag extends PropertyKey,
>(props: {
	on:   T | null | undefined,
	tag:  Tag,
	case: {[K in T[Tag]]: (v: Accessor<T & {[k in Tag]: K}>) => JSX.Element},
  fallback?: JSX.Element,
  partial?: false,
}): JSX.Element
export function Match<
	T extends {type: PropertyKey},
>(props: {
	on:   T | null | undefined,
	case: {[K in T['type']]: (v: Accessor<T & {[k in 'type']: K}>) => JSX.Element},
  fallback?: JSX.Element,
  partial?: false,
}): JSX.Element
export function Match<
	T extends {[k in Tag]: PropertyKey},
	Tag extends PropertyKey,
>(props: {
	on:   T | null | undefined,
	tag:  Tag,
	case: {[K in T[Tag]]?: (v: Accessor<T & {[k in Tag]: K}>) => JSX.Element},
  fallback?: JSX.Element,
  partial: true,
}): JSX.Element
export function Match<
	T extends {type: PropertyKey},
>(props: {
	on:   T | null | undefined,
	case: {[K in T['type']]?: (v: Accessor<T & {[k in 'type']: K}>) => JSX.Element},
  fallback?: JSX.Element,
  partial: true,
}): JSX.Element
export function Match(props: any): any {
	const kind = createMemo(() => props.on?.[props.tag ?? 'type'])
	return createMemo(() => props.case[kind()]?.(() => props.on) ?? props.fallback)
}
