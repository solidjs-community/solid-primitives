import { type Accessor, type JSX, createMemo } from "solid-js"

/**
 * Control-flow component for matching discriminated union (tagged union) members.
 * 
 * @example
 * ```tsx
 * type MyUnion = {
 *   kind: 'foo',
 *   foo:  'foo-value',
 * } | {
 *   kind: 'bar',
 *   bar:  'bar-value',
 * }
 * 
 * const [value, setValue] = s.createSignal<MyUnion>({kind: 'foo', foo: 'foo-value'})
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
	on:   T,
	tag:  Tag,
	case: {[K in T[Tag]]: (v: Accessor<T & {[k in Tag]: K}>) => JSX.Element},
}): JSX.Element
export function Match<
	T extends {kind: PropertyKey},
>(props: {
	on:   T,
	case: {[K in T['kind']]: (v: Accessor<T & {[k in 'kind']: K}>) => JSX.Element},
}): JSX.Element
export function Match(props: any): any {
	const kind = createMemo(() => props.on[props.tag ?? 'kind'])
	return createMemo(() => props.case[kind()](() => props.on))
}

