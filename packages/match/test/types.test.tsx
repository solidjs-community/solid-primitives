import * as v from "vitest";
import { MatchField, MatchTag, MatchValue } from "../src/index.ts";

// Type-level tests. These are checked by `tsc` (the root tsconfig includes package test files);
// every `@ts-expect-error` below must correspond to a real type error, otherwise tsc fails.
// The JSX is never rendered — the function is only defined, not called.

type TypeUnion = { type: "foo"; foo: "foo-value" } | { type: "bar"; bar: "bar-value" };
type KindUnion = { kind: "foo"; foo: "foo-value" } | { kind: "bar"; bar: "bar-value" };
type Literal = "foo" | "bar";

const typeCases = (
  typeValue: TypeUnion | undefined,
  kindValue: KindUnion | undefined,
  literal: Literal | undefined,
  flag: boolean,
  numericValue: { t: 1; a: "a" } | { t: 2; b: "b" } | null,
) => [
  // --- MatchTag: default `type` tag ---
  <MatchTag
    on={typeValue}
    case={{
      foo: v => <>{v().foo}</>,
      bar: v => <>{v().bar}</>,
    }}
  />,
  <MatchTag
    on={typeValue}
    // @ts-expect-error missing `bar` case
    case={{
      foo: v => <>{v().foo}</>,
    }}
  />,
  <MatchTag
    on={typeValue}
    case={{
      foo: v => <>{v().foo}</>,
      bar: v => <>{v().bar}</>,
      // @ts-expect-error unknown case
      baz: () => <></>,
    }}
  />,
  <MatchTag
    on={typeValue}
    case={{
      // @ts-expect-error `bar` does not exist on the `foo` member
      foo: v => <>{v().bar}</>,
      bar: v => <>{v().bar}</>,
    }}
  />,

  // --- MatchTag: custom `tag` ---
  <MatchTag
    on={kindValue}
    tag="kind"
    case={{
      foo: v => <>{v().foo}</>,
      bar: v => <>{v().bar}</>,
    }}
  />,
  <MatchTag
    on={kindValue}
    tag="kind"
    // @ts-expect-error missing `bar` case
    case={{
      foo: v => <>{v().foo}</>,
    }}
  />,
  <MatchTag
    // @ts-expect-error `type` is not a key of KindUnion (forgot `tag="kind"`)
    on={kindValue}
    case={{}}
  />,
  <MatchTag
    // @ts-expect-error `missing` is not a key of KindUnion
    on={kindValue}
    tag="missing"
    case={{}}
  />,
  <MatchTag<KindUnion, "kind">
    on={kindValue}
    tag="kind"
    case={{
      foo: v => <>{v().foo}</>,
      bar: v => <>{v().bar}</>,
    }}
  />,
  // @ts-expect-error explicit custom tag key without the runtime `tag` prop
  <MatchTag<KindUnion, "kind">
    on={kindValue}
    case={{
      foo: () => <></>,
      bar: () => <></>,
    }}
  />,

  // --- MatchTag: partial ---
  <MatchTag
    partial
    on={typeValue}
    case={{
      foo: v => <>{v().foo}</>,
    }}
  />,
  <MatchTag
    partial
    on={kindValue}
    tag="kind"
    case={{
      bar: v => <>{v().bar}</>,
    }}
  />,
  <MatchTag partial on={typeValue} case={{}} />,
  <MatchTag
    partial={false}
    on={typeValue}
    // @ts-expect-error `partial={false}` requires every case
    case={{
      foo: v => <>{v().foo}</>,
    }}
  />,
  <MatchTag
    partial={flag}
    on={typeValue}
    // @ts-expect-error a non-literal `partial` requires every case
    case={{
      foo: v => <>{v().foo}</>,
    }}
  />,
  <MatchTag<KindUnion, "kind", true> on={kindValue} tag="kind" case={{}} />,
  // explicit type arguments disable inference of `IsPartial`; `partial` must still work
  <MatchTag<TypeUnion> partial on={typeValue} case={{ foo: v => <>{v().foo}</> }} />,
  <MatchTag<KindUnion, "kind">
    partial
    on={kindValue}
    tag="kind"
    case={{ bar: v => <>{v().bar}</> }}
  />,
  <MatchTag
    partial
    on={typeValue}
    case={{
      // @ts-expect-error unknown case, even when partial
      baz: () => <></>,
    }}
  />,
  <MatchTag<TypeUnion>
    // With explicit type arguments + `partial`, an error makes both overloads fail, so the
    // general one also flags `partial` (its `IsPartial` is stuck at `false`) next to the real error.
    // @ts-expect-error see above
    partial
    on={typeValue}
    case={{
      // @ts-expect-error unknown case, even when partial with explicit type arguments
      baz: () => <></>,
    }}
  />,
  <MatchTag
    on={numericValue}
    tag="t"
    case={{
      1: v => <>{v().a}</>,
      2: v => <>{v().b}</>,
    }}
  />,

  // --- MatchTag: fallback, deprecated alias ---
  <MatchTag
    on={typeValue}
    case={{
      foo: v => <>{v().foo}</>,
      bar: v => <>{v().bar}</>,
    }}
    fallback={<>fallback</>}
  />,
  <MatchField
    on={kindValue}
    tag="kind"
    case={{
      foo: v => <>{v().foo}</>,
      bar: v => <>{v().bar}</>,
    }}
  />,

  // --- MatchValue ---
  <MatchValue
    on={literal}
    case={{
      foo: v => <>{v satisfies "foo"}</>,
      bar: v => <>{v satisfies "bar"}</>,
    }}
  />,
  <MatchValue
    on={literal}
    // @ts-expect-error missing `bar` case
    case={{
      foo: () => <></>,
    }}
  />,
  <MatchValue
    on={literal}
    case={{
      foo: () => <></>,
      bar: () => <></>,
      // @ts-expect-error unknown case
      baz: () => <></>,
    }}
  />,
  <MatchValue partial on={literal} case={{ foo: () => <></> }} />,
  <MatchValue<Literal> partial on={literal} case={{ foo: () => <></> }} />,
  <MatchValue
    partial={flag}
    on={literal}
    // @ts-expect-error a non-literal `partial` requires every case
    case={{ foo: () => <></> }}
  />,
  <MatchValue
    on={literal}
    case={{ foo: () => <></>, bar: () => <></> }}
    fallback={<>fallback</>}
  />,
];

v.test("type cases are checked by tsc", () => {
  v.expect(typeof typeCases).toBe("function");
});
