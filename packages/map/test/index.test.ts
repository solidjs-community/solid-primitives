import { ReactiveMap, ReactiveWeakMap } from "../src";
import { suite } from "uvu";
import * as assert from "uvu/assert";

const testMap = suite("ReactiveMap");

testMap("behaves like a Map", () => {
  const obj1 = {};
  const obj2 = {};

  const map = new ReactiveMap<any, any>([
    [obj1, 123],
    [1, "foo"]
  ]);

  assert.is(map.has(obj1), true);
  assert.is(map.has(1), true);
  assert.is(map.has(2), false);

  assert.is(map.get(obj1), 123);
  assert.is(map.get(1), "foo");

  map.set(obj2, "bar");
  assert.is(map.get(obj2), "bar");
  map.set(obj1, "change");
  assert.is(map.get(obj1), "change");

  assert.is(map.delete(obj2), true);
  assert.is(map.has(obj2), false);

  assert.is(map.size, 2);
  map.clear();
  assert.is(map.size, 0);

  assert.instance(map, Map);
  assert.instance(map, ReactiveMap);
});

testMap.run();

const testWeakMap = suite("ReactiveWeakMap");

testWeakMap("behaves like a Map", () => {
  const obj1 = {};
  const obj2 = {};

  const map = new ReactiveWeakMap<object, any>([[obj1, 123]]);

  assert.is(map.has(obj1), true);
  assert.is(map.has(obj2), false);

  assert.is(map.get(obj1), 123);

  map.set(obj2, "bar");
  assert.is(map.get(obj2), "bar");
  map.set(obj1, "change");
  assert.is(map.get(obj1), "change");

  assert.is(map.delete(obj2), true);
  assert.is(map.has(obj2), false);

  assert.instance(map, WeakMap);
  assert.instance(map, ReactiveWeakMap);
});

testWeakMap.run();
