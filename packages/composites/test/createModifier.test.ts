import { createRoot, createSignal, onCleanup } from "solid-js";
import { describe, expect, it } from "vitest";

import { createModifier, createCompositeEffect } from "../src";

describe("createModifier", () => {
  it("creating a modifier", () => {
    createRoot(dispose => {
      const captures: any[] = [];
      let captured_config: any = {};
      let captured_source: any;
      let captured_stop: any;

      const _cb = () => {};
      const _source = () => 0;

      const testModifier = createModifier<void, any, false>((source, callback, config, stop) => {
        captures.push("mod_cb");
        captured_config = config;
        captured_source = source;
        captured_stop = stop;
        return [callback, { test_return: "test" }];
      });

      const x = testModifier(_source, _cb);

      expect(captures.length).toBe(0);
      expect(x.initialCallback).toBe(_cb);
      expect(x.initialSource).toBe(_source);
      expect(x.stopRequired).toBe(false);
      expect(x.modifyers.length).toBe(1);
      expect(x.modifyers[0]).toBeInstanceOf(Function);

      const [modified_cb, returns] = x.modifyers[0](_cb, () => {});

      expect(captures.length).toBe(1);
      expect(modified_cb).toBe(_cb);
      expect(returns.test_return).toBe("test");

      const returns1 = createCompositeEffect(testModifier(_source, _cb));

      expect(returns1.test_return).toBe("test");
      expect(captures.length).toBe(2);
      expect(captured_config).toBe(undefined);
      expect(captured_source).toEqual(_source);
      expect(captured_stop).toBe(undefined);

      // @ts-ignore
      createCompositeEffect(testModifier(_source, _cb, { test_config: 123 }));

      expect(captured_config).toEqual({ test_config: 123 });

      dispose();
    });
  });

  it("creating a modifier with stop() available", () => {
    createRoot(dispose => {
      const captures: any[] = [];
      let captured_config: any = {};
      let captured_source: any;
      let captured_stop: any;

      const _cb = () => {};
      const _source = () => 0;

      const testModifier = createModifier<any, any, true>((source, callback, config, stop) => {
        captures.push("mod_cb");
        captured_config = config;
        captured_source = source;
        captured_stop = stop;
        return [callback, { test_return: "test" }];
      }, true);

      const x = testModifier(_source as any, _cb);

      expect(captures.length).toBe(0);
      expect(x.initialCallback).toBe(_cb);
      expect(x.initialSource).toBe(_source);
      expect(x.stopRequired).toBe(true);
      expect(x.modifyers.length).toBe(1);
      expect(x.modifyers[0]).toBeInstanceOf(Function);

      const [modified_cb, returns] = x.modifyers[0](_cb, () => {});

      expect(captures.length).toBe(1);
      expect(modified_cb).toBe(_cb);
      expect(returns.test_return).toBe("test");

      const returns1 = createCompositeEffect(testModifier(_source as any, _cb));

      expect(returns1.test_return).toBe("test");
      expect(returns1.stop).toBeUndefined();
      expect(captures.length).toBe(2);
      expect(captured_config).toBe(undefined);
      expect(captured_source).toEqual(_source);
      expect(captured_stop).toBeInstanceOf(Function);

      createCompositeEffect(testModifier(_source, _cb, { test_config: 123 }));

      expect(captured_config).toEqual({ test_config: 123 });

      dispose();
    });
  });

  it("nested modifiers", () => {
    createRoot(dispose => {
      const initialCB = () => {};
      const [count, setCount] = createSignal(0);

      const order: number[] = [];

      let cb_1_test = 0;

      const modifier1 = createModifier<any, any, true>((s, callback, config, stop) => {
        expect(stop).toBeInstanceOf(Function);
        expect(config.val1).toBe(1);
        const _fn = (...a: [any, any, any]) => {
          cb_1_test += 1;
          order.push(1);
          callback(...a);
        };
        return [_fn, { test_return1: "1" }];
      }, true);

      let cb_2_test = 0;

      const modifier2 = createModifier<any, any, true>((s, callback, config, stop) => {
        expect(stop).toBeInstanceOf(Function);
        expect(config.val2).toBe(2);
        const _fn = (...a: [any, any, any]) => {
          cb_2_test += 1;
          order.push(2);
          callback(...a);
        };
        return [_fn, { test_return2: "2" }];
      }, true);

      const returns = createCompositeEffect(
        modifier1(modifier2(count, initialCB, { val2: 2 }), { val1: 1 }),
      );

      expect(returns.test_return1).toBe("1");
      expect(returns.test_return2).toBe("2");

      setTimeout(() => {
        expect(order).toEqual([1, 2]);
        setCount(7);
        expect(cb_1_test).toBe(2);
        expect(cb_2_test).toBe(2);
        dispose();
      }, 0);
    });
  });

  it("disposing root immediately", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captures1 = [];
      let test_cleanup;

      const mod1 = createModifier<void, {}, true>((s, callback, c, stop) => {
        onCleanup(() => (test_cleanup = "ok"));
        stop();
        return [callback, {}];
      }, true);

      createCompositeEffect(mod1(counter, x => captures1.push(x)));

      expect(test_cleanup).toBe("ok");

      setTimeout(() => {
        expect(captures1.length).toBe(0);
        setCounter(7);
        expect(captures1.length).toEqual(0);
        setTimeout(dispose, 0);
      }, 0);
    });
  });

  it("disposing root in callback", () => {
    createRoot(dispose => {
      const [counter, setCounter] = createSignal(0);

      const captures1: number[] = [];
      let test_cleanup: string;

      const mod1 = createModifier<void, {}, true>((s, callback, c, stop) => {
        onCleanup(() => (test_cleanup = "ok"));
        const _fn = (...a: [any, any, any]) => {
          stop();
          callback(...a);
        };
        return [_fn, {}];
      }, true);

      createCompositeEffect(mod1(counter, x => captures1.push(x)));

      setTimeout(() => {
        expect(captures1).toEqual([0]);
        expect(test_cleanup).toBe("ok");
        setCounter(7);
        expect(captures1).toEqual([0]);
        dispose();
      }, 0);
    });
  });

  it("passing non-object config", () => {
    createRoot(dispose => {
      const [counter, _setCounter] = createSignal(0);

      let test_config;

      const mod = createModifier<number, {}>((s, callback, c) => {
        test_config = c;
        return [callback, {}];
      });

      createCompositeEffect(mod(counter, x => {}, 123));
      expect(test_config).toBe(123);
      dispose();
    });
  });
});
