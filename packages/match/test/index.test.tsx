import * as v from "vitest";
import * as s from "solid-js";
import { Match } from "../src/index.js";

v.describe("Match", () => {
  v.test("match on kind field", () => {

    type MyUnion = {
      kind: 'foo',
      foo:  'foo-value',
    } | {
      kind: 'bar',
      bar:  'bar-value',
    }

    const [value, setValue] = s.createSignal<MyUnion>()

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => <>
          <Match on={value()} case={{
            foo: v => <>{v().foo}</>,
            bar: v => <>{v().bar}</>,
          }} />
        </>)
      }
    })

    v.expect(data.result()).toEqual(undefined);

    setValue({kind: 'foo', foo: 'foo-value'});
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue({kind: 'bar', bar: 'bar-value'});
    v.expect(data.result()).toEqual(<>bar-value</>);

    data.dispose();
  });

  v.test("match on type field", () => {

    type MyUnion = {
      type: 'foo',
      foo:  'foo-value',
    } | {
      type: 'bar',
      bar:  'bar-value',
    }

    const [value, setValue] = s.createSignal<MyUnion>()

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => <>
          <Match on={value()} tag='type' case={{
            foo: v => <>{v().foo}</>,
            bar: v => <>{v().bar}</>,
          }} />
        </>)
      }
    })

    v.expect(data.result()).toEqual(undefined);

    setValue({type: 'foo', foo: 'foo-value'});
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue({type: 'bar', bar: 'bar-value'});
    v.expect(data.result()).toEqual(<>bar-value</>);

    data.dispose();
  });

  v.test("partial match", () => {

    type MyUnion = {
      kind: 'foo',
      foo:  'foo-value',
    } | {
      kind: 'bar',
      bar:  'bar-value',
    }

    const [value, setValue] = s.createSignal<MyUnion>()

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => <>
          <Match partial on={value()} case={{
            foo: v => <>{v().foo}</>,
          }} />
        </>)
      }
    })

    v.expect(data.result()).toEqual(undefined);

    setValue({kind: 'foo', foo: 'foo-value'});
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue({kind: 'bar', bar: 'bar-value'});
    v.expect(data.result()).toEqual(undefined);

    data.dispose();
  });

  v.test("fallback", () => {

    type MyUnion = {
      kind: 'foo',
      foo:  'foo-value',
    } | {
      kind: 'bar',
      bar:  'bar-value',
    }

    const [value, setValue] = s.createSignal<MyUnion>()

    const data = s.createRoot(dispose => {
      return {
        dispose,
        result: s.children(() => <>
          <Match on={value()} case={{
            foo: v => <>{v().foo}</>,
            bar: v => <>{v().bar}</>,
          }} fallback={<>fallback</>} />
        </>)
      }
    })

    v.expect(data.result()).toEqual(<>fallback</>);

    setValue({kind: 'foo', foo: 'foo-value'});
    v.expect(data.result()).toEqual(<>foo-value</>);

    setValue(undefined);
    v.expect(data.result()).toEqual(<>fallback</>);

    data.dispose();
  });
});
