import { createRoot, createSignal, onCleanup } from "solid-js";
import { test } from "uvu";
import * as assert from "uvu/assert";

import { createEffectModifier } from "../src/createEffectModifier";
import { createCompositeEffect } from "../src/createCompositeEffect";

test("creating a modifier", () => {
  createRoot(dispose => {
    const captures: any[] = [];
    let captured_config: any = {};
    let captured_source: any;
    let captured_stop: any;

    const _cb = () => {};
    const _source = () => 0;

    const testModifier = createEffectModifier<void, any, false>(
      (source, callback, config, stop) => {
        captures.push("mod_cb");
        captured_config = config;
        captured_source = source;
        captured_stop = stop;
        return [callback, { test_return: "test" }];
      }
    );

    const x = testModifier(_source, _cb);

    assert.is(captures.length, 0, "callback modification shouldn't yet happen");
    assert.is(
      x.initialCallback,
      _cb,
      "initial callback should match the one passed to the modifier"
    );
    assert.is(
      x.initialSource,
      _source,
      "initial source should match the one passed to the modifier"
    );
    assert.is(x.stopRequired, false, "stop shouldn't be required");
    assert.is(x.modifyers.length, 1, "there should be only one modidier");
    assert.type(x.modifyers[0], "function", "callback modifier is a function");

    const [modified_cb, returns] = x.modifyers[0](_cb, () => {});

    assert.is(captures.length, 1, "callback modifier should be called once");
    assert.is(modified_cb, _cb, "callback shouldn't be changed");
    assert.is(returns.test_return, "test", "returns match");

    const returns1 = createCompositeEffect(testModifier(_source, _cb));

    assert.is(
      returns1.test_return,
      "test",
      "modifiers returns should be returned from the createCompositeEffect"
    );
    assert.is(captures.length, 2, "callback modifier should be called twice at this point");
    assert.is(captured_config, undefined, "no config should be passed");
    assert.equal(captured_source, _source, "captured source should math the passed source");
    assert.is(captured_stop, undefined, "stop() shouldn't be passed to modifier");

    // @ts-ignore
    createCompositeEffect(testModifier(_source, _cb, { test_config: 123 }));

    assert.equal(
      captured_config,
      { test_config: 123 },
      "captured config should math the passed config"
    );

    dispose();
  });
});

test("creating a modifier with stop() available", () => {
  createRoot(dispose => {
    const captures: any[] = [];
    let captured_config: any = {};
    let captured_source: any;
    let captured_stop: any;

    const _cb = () => {};
    const _source = () => 0;

    const testModifier = createEffectModifier<any, any, true>((source, callback, config, stop) => {
      captures.push("mod_cb");
      captured_config = config;
      captured_source = source;
      captured_stop = stop;
      return [callback, { test_return: "test" }];
    }, true);

    const x = testModifier(_source as any, _cb);

    assert.is(captures.length, 0, "callback modification shouldn't yet happen");
    assert.is(
      x.initialCallback,
      _cb,
      "initial callback should match the one passed to the modifier"
    );
    assert.is(
      x.initialSource,
      _source,
      "initial source should match the one passed to the modifier"
    );
    assert.is(x.stopRequired, true, "stop should be required");
    assert.is(x.modifyers.length, 1, "there should be only one modidier");
    assert.type(x.modifyers[0], "function", "callback modifier is a function");

    const [modified_cb, returns] = x.modifyers[0](_cb, () => {});

    assert.is(captures.length, 1, "callback modifier should be called once");
    assert.is(modified_cb, _cb, "callback shouldn't be changed");
    assert.is(returns.test_return, "test", "returns match");

    const returns1 = createCompositeEffect(testModifier(_source as any, _cb));

    assert.is(
      returns1.test_return,
      "test",
      "modifiers returns should be returned from the createCompositeEffect"
    );
    assert.type(
      returns1.stop,
      "undefined",
      "stop() should not be returned from the createCompositeEffect"
    );
    assert.is(captures.length, 2, "callback modifier should be called twice at this point");
    assert.is(captured_config, undefined, "no config should be passed");
    assert.equal(captured_source, _source, "captured source should math the passed source");
    assert.type(captured_stop, "function", "stop() should be passed to modifier");

    createCompositeEffect(testModifier(_source, _cb, { test_config: 123 }));

    assert.equal(
      captured_config,
      { test_config: 123 },
      "captured config should math the passed config"
    );

    dispose();
  });
});

test("nested modifiers", () => {
  createRoot(dispose => {
    const initialCB = () => {};
    const [count, setCount] = createSignal(0);

    const order = [];

    let cb_1_test = 0;

    const modifier1 = createEffectModifier<any, any, true>((s, callback, config, stop) => {
      assert.type(stop, "function", "stop() should be a function");
      assert.is(config.val1, 1, "config wasn't passed to mod 1");
      const _fn = (...a: [any, any, any]) => {
        cb_1_test += 1;
        order.push(1);
        callback(...a);
      };
      return [_fn, { test_return1: "1" }];
    }, true);

    let cb_2_test = 0;

    const modifier2 = createEffectModifier<any, any, true>((s, callback, config, stop) => {
      assert.type(stop, "function", "stop() should be a function");
      assert.is(config.val2, 2, "config wasn't passed to mod 2");
      const _fn = (...a: [any, any, any]) => {
        cb_2_test += 1;
        order.push(2);
        callback(...a);
      };
      return [_fn, { test_return2: "2" }];
    }, true);

    const returns = createCompositeEffect(
      modifier1(modifier2(count, initialCB, { val2: 2 }), { val1: 1 })
    );

    assert.is(returns.test_return1, "1", "incorrect return from mod 1");
    assert.is(returns.test_return2, "2", "incorrect return from mod 2");

    setTimeout(() => {
      assert.equal(order, [1, 2], "mod 1 should run before mod 2");
      setCount(7);
      assert.is(cb_1_test, 2, "mod 1 callback should run twice");
      assert.is(cb_2_test, 2, "mod 2 callback should run twice");
      dispose();
    }, 0);
  });
});

test("disposing root immediately", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captures1 = [];
    let test_cleanup;

    const mod1 = createEffectModifier<void, {}, true>((s, callback, c, stop) => {
      onCleanup(() => (test_cleanup = "ok"));
      stop();
      return [callback, {}];
    }, true);

    createCompositeEffect(mod1(counter, x => captures1.push(x)));

    assert.is(test_cleanup, "ok", "cleanup should happen immediately");

    setTimeout(() => {
      assert.is(captures1.length, 0, "initial state shouldn't get captured");
      setCounter(7);
      assert.equal(captures1.length, 0, "next change shouldn't get captured");
      setTimeout(dispose, 0);
    }, 0);
  });
});

test("disposing root in callback", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    const captures1 = [];
    let test_cleanup;

    const mod1 = createEffectModifier<void, {}, true>((s, callback, c, stop) => {
      onCleanup(() => (test_cleanup = "ok"));
      const _fn = (...a: [any, any, any]) => {
        stop();
        callback(...a);
      };
      return [_fn, {}];
    }, true);

    createCompositeEffect(mod1(counter, x => captures1.push(x)));

    setTimeout(() => {
      assert.equal(captures1, [0], "initial state should get captured");
      assert.is(test_cleanup, "ok", "cleanup should happen after initial effect");
      setCounter(7);
      assert.equal(captures1, [0], "next change shouldn't get captured");
      dispose();
    }, 0);
  });
});

test("passing non-object config", () => {
  createRoot(dispose => {
    const [counter, setCounter] = createSignal(0);

    let test_config;

    const mod = createEffectModifier<number, {}>((s, callback, c) => {
      test_config = c;
      return [callback, {}];
    });

    createCompositeEffect(mod(counter, x => {}, 123));
    assert.is(test_config, 123, "non-object config should be passed without issues");
    dispose();
  });
});

test.run();
