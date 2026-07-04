import { type Accessor, createMemo } from "solid-js";
import type { JSX } from "@solidjs/web";

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
 * <MatchTag on={value()} case={{
 *   foo: v => <>{v().foo}</>,
 *   bar: v => <>{v().bar}</>,
 * }} />
 * ```
 */
// Tag values are constrained to string | number rather than PropertyKey because symbol keys
// cannot be expressed in inline object literals, making symbol-tagged unions impossible to
// match in practice. The narrower constraint surfaces the error at the tag field rather than
// inside the mapped type where it is harder to diagnose.
export function MatchTag<T extends { [k in Tag]: string | number }, Tag extends string | number>(props: {
  on: T | null | undefined;
  tag: Tag;
  case: { [K in T[Tag]]: (v: Accessor<T & { [k in Tag]: K }>) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial?: false;
}): JSX.Element;
export function MatchTag<T extends { type: string | number }>(props: {
  on: T | null | undefined;
  case: { [K in T["type"]]: (v: Accessor<T & { [k in "type"]: K }>) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial?: false;
}): JSX.Element;
export function MatchTag<T extends { [k in Tag]: string | number }, Tag extends string | number>(props: {
  on: T | null | undefined;
  tag: Tag;
  case: { [K in T[Tag]]?: (v: Accessor<T & { [k in Tag]: K }>) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial: true;
}): JSX.Element;
export function MatchTag<T extends { type: string | number }>(props: {
  on: T | null | undefined;
  case: { [K in T["type"]]?: (v: Accessor<T & { [k in "type"]: K }>) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial: true;
}): JSX.Element;
export function MatchTag(props: any): any {
  const value = () => props.on;
  const kind = createMemo(() => props.on?.[props.tag ?? "type"]);
  return createMemo(() => props.case[kind()]?.(value) ?? props.fallback);
}

/** @deprecated Use {@link MatchTag} instead. */
export { MatchTag as MatchField };

/**
 * Control-flow component for matching union literals.
 *
 * @example
 * ```tsx
 * type MyUnion = 'foo' | 'bar'
 *
 * const [value, setValue] = createSignal<MyUnion>('foo')
 *
 * <MatchValue on={value()} case={{
 *   foo: () => <p>foo</p>,
 *   bar: () => <p>bar</p>,
 * }} />
 * ```
 */
export function MatchValue<T extends string | number>(props: {
  on: T | null | undefined;
  case: { [K in T]: (v: K) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial?: false;
}): JSX.Element;
export function MatchValue<T extends string | number>(props: {
  on: T | null | undefined;
  case: { [K in T]?: (v: K) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial: true;
}): JSX.Element;
export function MatchValue(props: any): any {
  const kind = createMemo(() => props.on);
  return createMemo(() => props.case[kind()]?.(kind()) ?? props.fallback);
}
