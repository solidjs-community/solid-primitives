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

import { createSignal, getObserver, getOwner, $PROXY, $TRACK, DEV, type Setter } from "solid-js";

/** Raw target type for the mutable proxy — any plain object or array. */
type MutableNode = Record<PropertyKey, any>;
import { isServer } from "@solidjs/web";

/**
 * Returns true only for plain objects and arrays — the types that can be
 * safely deep-proxied. Excludes class instances (Date, Map, Set, …) whose
 * prototype methods require the real object as `this`.
 */
function isWrappable<T>(obj: T | null | undefined): obj is T;
function isWrappable(obj: any): boolean {
  if (obj == null || typeof obj !== "object" || Object.isFrozen(obj)) return false;
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype || Array.isArray(obj);
}

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

function getNodes(target: MutableNode, symbol: typeof $NODE | typeof $HAS): DataNodes {
  let nodes = target[symbol];
  if (!nodes)
    Object.defineProperty(target, symbol, { value: (nodes = Object.create(null) as DataNodes) });
  return nodes;
}

function getNode(nodes: DataNodes, property: PropertyKey, value?: any): DataNode | undefined {
  if (nodes[property]) return nodes[property];

  const [s, set] = createSignal(value, {
    equals: false,
    ownedWrite: true,
  }) as unknown as [DataNode, Setter<any>];

  s.$ = set;
  return (nodes[property] = s);
}

function trackSelf(target: MutableNode): void {
  getObserver() && getNode(getNodes(target, $NODE), $SELF)!();
}

function ownKeys(target: MutableNode) {
  trackSelf(target);
  return Reflect.ownKeys(target);
}

function setProperty(
  state: MutableNode,
  property: PropertyKey,
  value: any,
  deleting: boolean = false,
): void {
  if (!deleting && state[property] === value) return;

  const prev = state[property],
    len = state.length;

  if (DEV)
    DEV.hooks.onStoreNodeUpdate &&
      DEV.hooks.onStoreNodeUpdate(state, property, value, prev);

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

function proxyDescriptor(target: MutableNode, property: PropertyKey) {
  const desc = Reflect.getOwnPropertyDescriptor(target, property);

  if (
    desc &&
    !desc.get &&
    !desc.set &&
    desc.configurable &&
    property !== $PROXY &&
    property !== $NODE
  ) {
    delete desc.value;
    delete desc.writable;
    desc.get = () => target[$PROXY][property];
    desc.set = v => (target[$PROXY][property] = v);
  }

  return desc;
}

const proxyTraps: ProxyHandler<MutableNode> = {
  get(target, property, receiver) {
    if (property === $PROXY) return receiver;
    if (property === $TRACK) {
      trackSelf(target);
      return receiver;
    }

    const nodes = getNodes(target, $NODE),
      tracked = nodes[property];

    if (property === $NODE || property === $HAS || property === "__proto__")
      return tracked ? tracked() : target[property];

    const desc = Object.getOwnPropertyDescriptor(target, property),
      isFn = typeof target[property] === "function";

    let value: any;

    if (getObserver()) {
      // Inside a reactive context: use signals for dependency tracking.
      // Signal values are stable (last-flushed) — correct inside effects/memos.
      if (tracked) {
        value = tracked();
      } else if ((!isFn || target.hasOwnProperty(property)) && !(desc && desc.get)) {
        value = getNode(nodes, property, target[property])!();
      } else {
        value = target[property];
      }
    } else {
      // Outside reactive context: read directly from the target.
      // Signals may hold stale values between a write and the next flush.
      value = target[property];

      // Bind array prototype methods to the receiver so mutations go through the proxy.
      if (value != null && isFn && value === Array.prototype[property as any])
        return (...args: unknown[]) => Array.prototype[property as any].apply(receiver, args);
    }

    return isWrappable(value) ? wrap(value) : value;
  },

  has(target, property) {
    if (
      property === $PROXY ||
      property === $TRACK ||
      property === $NODE ||
      property === $HAS ||
      property === "__proto__"
    )
      return true;
    getObserver() && getNode(getNodes(target, $HAS), property)!();
    return property in target;
  },

  set(target, property, value) {
    setProperty(target, property, value);
    return true;
  },

  deleteProperty(target, property) {
    setProperty(target, property, undefined, true);
    return true;
  },

  ownKeys: ownKeys,

  getOwnPropertyDescriptor: proxyDescriptor,

  /*
  TODO: add defineProperty trap
  https://github.com/solidjs/solid/issues/1392
  */
};

function wrap<T extends MutableNode>(value: T): T {
  let proxy = value[$PROXY];

  if (!proxy) {
    Object.defineProperty(value, $PROXY, { value: (proxy = new Proxy(value, proxyTraps)) });

    const desc = Object.getOwnPropertyDescriptors(value);

    for (const prop of Object.keys(value)) {
      if (desc[prop]!.get) Object.defineProperty(value, prop, { get: desc[prop]!.get.bind(proxy) });

      if (desc[prop]!.set) {
        const og = desc[prop]!.set;

        Object.defineProperty(value, prop, { set: v => og.call(proxy, v) });
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
export function createMutable<T extends MutableNode>(state: T, _options?: MutableOptions): T {
  /*
    TODO: improve server noop
    https://github.com/solidjs/solid/issues/1733
  */
  if (isServer) return state;

  const unwrappedStore = state;

  if (DEV && typeof unwrappedStore !== "object" && typeof unwrappedStore !== "function")
    throw new Error(
      `Unexpected type ${typeof unwrappedStore} received when initializing 'createMutable'. Expected an object.`,
    );

  const wrappedStore = wrap(unwrappedStore);

  if (DEV) DEV.hooks.onGraph?.(unwrappedStore, getOwner());

  return wrappedStore;
}

/**
 * Helper function that applies multiple changes to a mutable Store via a single modifier function.
 * All writes to the store are automatically batched, so dependent computations update once
 * rather than once per individual change.
 *
 * @param state The mutable Store to modify
 * @param modifier a function that receives the mutable proxy and applies changes directly
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
 * // Modify two fields, all writes batched automatically
 * modifyMutable(state.user, u => {
 *   u.firstName = "Jake";
 *   u.lastName = "Johnson";
 * });
 * ```
 */
export function modifyMutable<T>(state: T, modifier: (state: T) => void): void {
  modifier(state);
}
