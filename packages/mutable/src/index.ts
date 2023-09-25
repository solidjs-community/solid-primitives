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

export function createMutable<T extends solid_store.StoreNode>(
  state: T,
  options?: MutableOptions,
): T {
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

export function modifyMutable<T>(state: T, modifier: (state: T) => T) {
  solid.batch(() => modifier(solid_store.unwrap(state)));
}
