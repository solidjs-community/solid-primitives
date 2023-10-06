/*

Version 1.0 of the primitive is a direct copy from SolidJS version 1.7.12:
https://github.com/solidjs/solid/blob/063db14c4e69f411ac2c09f5044e2d262fa667b9/packages/solid/store/src/mutable.ts


MIT License

Copyright (c) 2023 Ryan Carniato

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


Further issues to possibly address after version 2.0:

- `undefined deletes`, `defineProperty` is not supported, symbol marks
https://github.com/solidjs/solid/issues/1392

- symbol marks (needs to be addressed in solid-js/store first)
https://github.com/solidjs/solid/issues/1106

- wrapping classes
https://github.com/solidjs/solid/issues/1746

- too simple server noop
https://github.com/solidjs/solid/issues/1733

- deleting a property doesn't clean the signals
(arrays are the big concern here, objects are meant to be static)
(it probably should be addressed in solid-js/store first)

*/

import * as solid from "solid-js";
import * as solid_store from "solid-js/store";
import { isDev, isServer } from "solid-js/web";

const $NODE = Symbol("mutable-node"),
  $HAS = Symbol("mutable-has"),
  $SELF = Symbol("mutable-self");

type DataNode = {
  /** READ */
  (): any;
  /** WRITE */
  $(value?: any): void;
};
type DataNodes = Record<PropertyKey, DataNode | undefined>;

/**
 * This function is copied from solid-js/store/src/store.ts
 * TODO: probably should be exported from solid-js/store
 */
function isWrappable<T>(obj: T | solid_store.NotWrappable): obj is T;
function isWrappable(obj: any) {
  let proto;
  return (
    obj != null &&
    typeof obj === "object" &&
    (obj[solid.$PROXY] ||
      !(proto = Object.getPrototypeOf(obj)) ||
      proto === Object.prototype ||
      Array.isArray(obj))
  );
}

function getNodes(target: solid_store.StoreNode, symbol: typeof $NODE | typeof $HAS): DataNodes {
  let nodes = target[symbol];
  if (!nodes)
    Object.defineProperty(target, symbol, { value: (nodes = Object.create(null) as DataNodes) });
  return nodes;
}

function getNode(nodes: DataNodes, property: PropertyKey, value?: any): DataNode | undefined {
  if (nodes[property]) return nodes[property];

  const [s, set] = solid.createSignal(value, {
    equals: false,
    internal: true,
  }) as [DataNode, solid.Setter<any>];

  s.$ = set;
  return (nodes[property] = s);
}

function trackSelf(target: solid_store.StoreNode): void {
  solid.getListener() && getNode(getNodes(target, $NODE), $SELF)!();
}

function ownKeys(target: solid_store.StoreNode) {
  trackSelf(target);
  return Reflect.ownKeys(target);
}

function setProperty(
  state: solid_store.StoreNode,
  property: PropertyKey,
  value: any,
  deleting: boolean = false,
): void {
  if (!deleting && state[property] === value) return;

  const prev = state[property],
    len = state.length;

  if (isDev)
    solid_store.DEV!.hooks.onStoreNodeUpdate &&
      solid_store.DEV!.hooks.onStoreNodeUpdate(state, property, value, prev);

  /*
    TODO: setting to undefined should not delete the property
  */
  if (value === undefined) {
    delete state[property];
    if (state[$HAS] && state[$HAS][property] && prev !== undefined) state[$HAS][property].$();
  } else {
    state[property] = value;
    if (state[$HAS] && state[$HAS][property] && prev === undefined) state[$HAS][property].$();
  }

  // eslint-disable-next-line prefer-const
  let nodes = getNodes(state, $NODE),
    node: DataNode | undefined;

  if ((node = getNode(nodes, property, prev))) node.$(() => value);

  if (Array.isArray(state) && state.length !== len) {
    for (let i = state.length; i < len; i++) (node = nodes[i]) && node.$();

    (node = getNode(nodes, "length", len)) && node.$(state.length);
  }

  (node = nodes[$SELF]) && node.$();
}

function proxyDescriptor(target: solid_store.StoreNode, property: PropertyKey) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);

  if (
    desc &&
    !desc.get &&
    !desc.set &&
    desc.configurable &&
    property !== solid.$PROXY &&
    property !== $NODE
  ) {
    delete desc.value;
    delete desc.writable;
    desc.get = () => target[solid.$PROXY][property];
    desc.set = v => (target[solid.$PROXY][property] = v);
  }

  return desc;
}

const proxyTraps: ProxyHandler<solid_store.StoreNode> = {
  get(target, property, receiver) {
    if (property === solid_store.$RAW) return target;
    if (property === solid.$PROXY) return receiver;
    if (property === solid.$TRACK) {
      trackSelf(target);
      return receiver;
    }

    const nodes = getNodes(target, $NODE),
      tracked = nodes[property];
    let value = tracked ? tracked() : target[property];

    if (property === $NODE || property === $HAS || property === "__proto__") return value;

    if (!tracked) {
      const desc = Object.getOwnPropertyDescriptor(target, property),
        isFn = typeof value === "function";

      if (solid.getListener() && (!isFn || target.hasOwnProperty(property)) && !(desc && desc.get))
        value = getNode(nodes, property, value)!();
      else if (value != null && isFn && value === Array.prototype[property as any])
        return (...args: unknown[]) =>
          solid.batch(() => Array.prototype[property as any].apply(receiver, args));
    }

    return isWrappable(value) ? wrap(value) : value;
  },

  has(target, property) {
    if (
      property === solid_store.$RAW ||
      property === solid.$PROXY ||
      property === solid.$TRACK ||
      property === $NODE ||
      property === $HAS ||
      property === "__proto__"
    )
      return true;
    solid.getListener() && getNode(getNodes(target, $HAS), property)!();
    return property in target;
  },

  set(target, property, value) {
    solid.batch(() => setProperty(target, property, solid_store.unwrap(value)));
    return true;
  },

  deleteProperty(target, property) {
    solid.batch(() => setProperty(target, property, undefined, true));
    return true;
  },

  ownKeys: ownKeys,

  getOwnPropertyDescriptor: proxyDescriptor,

  /*
  TODO: add defineProperty trap
  https://github.com/solidjs/solid/issues/1392
  */
};

function wrap<T extends solid_store.StoreNode>(value: T): T {
  let proxy = value[solid.$PROXY];

  if (!proxy) {
    Object.defineProperty(value, solid.$PROXY, { value: (proxy = new Proxy(value, proxyTraps)) });

    const desc = Object.getOwnPropertyDescriptors(value);

    for (const prop of Object.keys(value)) {
      if (desc[prop]!.get)
        Object.defineProperty(value, prop, { get: desc[prop]!.get!.bind(proxy) });

      if (desc[prop]!.set) {
        const og = desc[prop]!.set!;

        Object.defineProperty(value, prop, { set: v => solid.batch(() => og.call(proxy, v)) });
      }
    }
  }

  return proxy;
}

export type MutableOptions = { name?: string };

/**
 * Creates a new mutable Store proxy object. Stores only trigger updates on values changing
 * Tracking is done by intercepting property access and automatically tracks deep nesting via proxy.
 *
 * Useful for integrating external systems or as a compatibility layer with MobX/Vue.
 *
 * @param state original object to be wrapped in a proxy (the object is not cloned)
 * @param options Name of the store (used for debugging)
 * @returns mutable proxy of the {@link state} object
 *
 * @example
 * ```ts
 * const state = createMutable(initialValue);
 *
 * // read value
 * state.someValue;
 *
 * // set value
 * state.someValue = 5;
 *
 * state.list.push(anotherValue);
 * ```
 */
export function createMutable<T extends solid_store.StoreNode>(
  state: T,
  options?: MutableOptions,
): T {
  /*
    TODO: improve server noop
    https://github.com/solidjs/solid/issues/1733
  */
  if (isServer) return state;

  // TODO: remove this later
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const unwrappedStore = solid_store.unwrap(state || {});

  if (isDev && typeof unwrappedStore !== "object" && typeof unwrappedStore !== "function")
    throw new Error(
      `Unexpected type ${typeof unwrappedStore} received when initializing 'createMutable'. Expected an object.`,
    );

  const wrappedStore = wrap(unwrappedStore);

  if (isDev) solid.DEV!.registerGraph({ value: unwrappedStore, name: options && options.name });

  return wrappedStore;
}

/**
 * Helper function that simplifies making multiple changes to a mutable Store in a single batch, so that dependant computations update just once instead of once per update.
 *
 * @param state The mutable Store to modify
 * @param modifier a Store modifier such as those returned by `reconcile` or `produce` (from `"solid-js/store"`). *(If you pass in your own modifier function, beware that its argument is an unwrapped version of the Store.)*
 *
 * @example
 * ```ts
 * const state = createMutable({
 *   user: {
 *     firstName: "John",
 *     lastName: "Smith",
 *   },
 * });
 *
 * // Replace state.user with the specified object (deleting any other fields)
 * modifyMutable(state.user, reconcile({
 *   firstName: "Jake",
 *   lastName: "Johnson",
 * });
 *
 * // Modify two fields in batch, triggering just one update
 * modifyMutable(state.user, produce((u) => {
 *   u.firstName = "Jake";
 *   u.lastName = "Johnson";
 * });
 * ```
 */
export function modifyMutable<T>(state: T, modifier: (state: T) => T): void {
  solid.batch(() => modifier(solid_store.unwrap(state)));
}
