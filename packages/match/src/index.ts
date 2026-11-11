import { type Accessor, createMemo } from "solid-js";
import type { JSX } from "@solidjs/web";

/**
 * The `case` prop type: every case is required, unless `partial` is `true`.
 * A non-literal `boolean` keeps every case required.
 */
type MatchCases<IsPartial extends boolean, Cases> = [IsPartial] extends [true]
  ? Partial<Cases>
  : Cases;

/**
 * The `tag` prop is optional only while the tag key is the default `"type"`, so a custom tag key
 * passed as an explicit type argument (`<MatchTag<MyUnion, "kind">>`) must also be passed at runtime.
 */
type MatchTagKeyProp<TagKey extends string | number> = [TagKey] extends ["type"]
  ? { tag?: TagKey }
  : { tag: TagKey };

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
//
// The last (general) signature carries everything, so a missing case is reported against the
// `case` prop itself — TypeScript reports the error of the last overload it tried. The first
// overload only exists so that `partial` keeps working when type arguments are passed explicitly
// (`<MatchTag<MyUnion> partial …>`): explicit type arguments disable inference, so the general
// signature's `IsPartial` would be stuck at its `false` default.
export function MatchTag<
  T extends { [k in TagKey]: string | number },
  TagKey extends string | number = "type",
>(
  props: {
    on: T | null | undefined;
    case: { [K in T[TagKey]]?: (v: Accessor<T & { [k in TagKey]: K }>) => JSX.Element };
    fallback?: JSX.Element;
    /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
    partial: true;
  } & MatchTagKeyProp<TagKey>,
): JSX.Element;
export function MatchTag<
  T extends { [k in TagKey]: string | number },
  TagKey extends string | number = "type",
  IsPartial extends boolean = false,
>(
  props: {
    on: T | null | undefined;
    case: MatchCases<
      IsPartial,
      { [K in T[TagKey]]: (v: Accessor<T & { [k in TagKey]: K }>) => JSX.Element }
    >;
    fallback?: JSX.Element;
    /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
    partial?: IsPartial;
  } & MatchTagKeyProp<TagKey>,
): JSX.Element;
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
// See `MatchTag` for why the `partial: true` overload precedes the general signature.
export function MatchValue<T extends string | number>(props: {
  on: T | null | undefined;
  case: { [K in T]?: (v: K) => JSX.Element };
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial: true;
}): JSX.Element;
export function MatchValue<T extends string | number, IsPartial extends boolean = false>(props: {
  on: T | null | undefined;
  case: MatchCases<IsPartial, { [K in T]: (v: K) => JSX.Element }>;
  fallback?: JSX.Element;
  /** Type-only — no runtime effect. Relaxes `case` to allow partial union coverage. */
  partial?: IsPartial;
}): JSX.Element;
export function MatchValue(props: any): any {
  const kind = createMemo(() => props.on);
  return createMemo(() => props.case[kind()]?.(kind()) ?? props.fallback);
}
