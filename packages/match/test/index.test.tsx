import * as v from "vitest";
import * as s from "solid-js";
import { MatchTag, MatchValue } from "../src/index.js";

v.describe("Match", () => {
  v.test("match on type field", () => {
    type MyUnion =
      | {
          type: "foo";
          foo: "foo-value";
        }
      | {
          type: "bar";
          bar: "bar-value";
        };

    const [value, setValue] = s.createSignal<MyUnion>();

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => (
          <>
            <MatchTag
              on={value()}
              case={{
                foo: v => <>{v().foo}</>,
                bar: v => <>{v().bar}</>,
              }}
            />
          </>
        )),
      };
    });

    v.expect(data.result()).toEqual(undefined);

    setValue({ type: "foo", foo: "foo-value" });
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue({ type: "bar", bar: "bar-value" });
    v.expect(data.result()).toEqual(<>bar-value</>);

    data.dispose();
  });

  v.test("match on kind field", () => {
    type MyUnion =
      | {
          kind: "foo";
          foo: "foo-value";
        }
      | {
          kind: "bar";
          bar: "bar-value";
        };

    const [value, setValue] = s.createSignal<MyUnion>();

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => (
          <>
            <MatchTag
              on={value()}
              tag="kind"
              case={{
                foo: v => <>{v().foo}</>,
                bar: v => <>{v().bar}</>,
              }}
            />
          </>
        )),
      };
    });

    v.expect(data.result()).toEqual(undefined);

    setValue({ kind: "foo", foo: "foo-value" });
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue({ kind: "bar", bar: "bar-value" });
    v.expect(data.result()).toEqual(<>bar-value</>);

    data.dispose();
  });

  v.test("partial match", () => {
    type MyUnion =
      | {
          type: "foo";
          foo: "foo-value";
        }
      | {
          type: "bar";
          bar: "bar-value";
        };

    const [value, setValue] = s.createSignal<MyUnion>();

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => (
          <>
            <MatchTag
              partial
              on={value()}
              case={{
                foo: v => <>{v().foo}</>,
              }}
            />
          </>
        )),
      };
    });

    v.expect(data.result()).toEqual(undefined);

    setValue({ type: "foo", foo: "foo-value" });
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue({ type: "bar", bar: "bar-value" });
    v.expect(data.result()).toEqual(undefined);

    data.dispose();
  });

  v.test("fallback", () => {
    type MyUnion =
      | {
          type: "foo";
          foo: "foo-value";
        }
      | {
          type: "bar";
          bar: "bar-value";
        };

    const [value, setValue] = s.createSignal<MyUnion>();

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => (
          <>
            <MatchTag
              on={value()}
              case={{
                foo: v => <>{v().foo}</>,
                bar: v => <>{v().bar}</>,
              }}
              fallback={<>fallback</>}
            />
          </>
        )),
      };
    });

    v.expect(data.result()).toEqual(<>fallback</>);

    setValue({ type: "foo", foo: "foo-value" });
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue(undefined);
    v.expect(data.result()).toEqual(<>fallback</>);

    data.dispose();
  });
});

v.describe("MatchValue", () => {
  v.test("match on union literal", () => {
    type MyUnion = "foo" | "bar";
    const [value, setValue] = s.createSignal<MyUnion>();
    const data = s.createRoot(dispose => ({
      dispose,
      result: s.children(() => (
        <>
          <MatchValue
            on={value()}
            case={{
              foo: () => <p>foo</p>,
              bar: () => <p>bar</p>,
            }}
          />
        </>
      )),
    }));
    v.expect(data.result()).toEqual(undefined);
    setValue("foo");
    v.expect(data.result()).toEqual(
      <>
        <p>foo</p>
      </>,
    );
    setValue("bar");
    v.expect(data.result()).toEqual(
      <>
        <p>bar</p>
      </>,
    );
    data.dispose();
  });

  v.test("partial match", () => {
    type MyUnion = "foo" | "bar";
    const [value, setValue] = s.createSignal<MyUnion>();
    const data = s.createRoot(dispose => ({
      dispose,
      result: s.children(() => (
        <>
          <MatchValue
            partial
            on={value()}
            case={{
              foo: () => <p>foo</p>,
            }}
          />
        </>
      )),
    }));
    v.expect(data.result()).toEqual(undefined);
    setValue("foo");
    v.expect(data.result()).toEqual(
      <>
        <p>foo</p>
      </>,
    );
    setValue("bar");
    v.expect(data.result()).toEqual(undefined);
    data.dispose();
  });

  v.test("fallback", () => {
    type MyUnion = "foo" | "bar";
    const [value, setValue] = s.createSignal<MyUnion>();
    const data = s.createRoot(dispose => ({
      dispose,
      result: s.children(() => (
        <>
          <MatchValue
            on={value()}
            case={{
              foo: () => <p>foo</p>,
              bar: () => <p>bar</p>,
            }}
            fallback={<p>fallback</p>}
          />
        </>
      )),
    }));
    v.expect(data.result()).toEqual(
      <>
        <p>fallback</p>
      </>,
    );
    setValue("foo");
    v.expect(data.result()).toEqual(
      <>
        <p>foo</p>
      </>,
    );
    setValue(undefined);
    v.expect(data.result()).toEqual(
      <>
        <p>fallback</p>
      </>,
    );
    data.dispose();
  });
});
