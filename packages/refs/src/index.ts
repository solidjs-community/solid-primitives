import { filterInstance, remove, removeItems } from "@solid-primitives/immutable";
import { createSubRoot } from "@solid-primitives/rootless";
import { access, asArray, Directive, Get, ItemsOf, Many } from "@solid-primitives/utils";
import {
  Accessor,
  children as _children,
  Component,
  createComputed,
  createMemo,
  createSignal,
  JSX,
  on,
  onCleanup,
  onMount,
  untrack,
  getOwner,
  Setter
} from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      unmount: Get<Element>;
    }
  }
}
export type E = JSX.Element;

export type ResolvedJSXElement = Many<Exclude<JSX.Element, JSX.ArrayElement | JSX.FunctionElement>>;
export const children = _children as (fn: Accessor<JSX.Element>) => Accessor<ResolvedJSXElement>;

const mutableRemove = <T>(list: T[], item: T): void => {
  const index = list.indexOf(item);
  list.splice(index, 1);
};

export function getChangedItems<T>(
  prevList: readonly T[],
  list: readonly T[]
): [added: T[], removed: T[]] {
  const prev = prevList.slice();
  const added: T[] = [];
  for (const el of list) {
    const index = prev.indexOf(el);
    if (index !== -1) prev.splice(index, 1);
    else added.push(el);
  }
  return [added, prev];
}
export const getAddedItems = <T>(prevList: readonly T[], list: readonly T[]): T[] =>
  list.filter(item => !prevList.includes(item));
export const getRemovedItems = <T>(prevList: readonly T[], list: readonly T[]): T[] =>
  prevList.filter(item => !list.includes(item));

// export type ElementTagName = keyof JSX.IntrinsicElements;
// export type ElementOfTagName<
//   T extends ElementTagName,
//   Ref = JSX.IntrinsicElements[T]["ref"]
// > = Exclude<Ref extends (el: any) => void ? Parameters<Ref>[0] : Ref, undefined>;

// export function isElement(v: any): v is Element;
// export function isElement<T extends ElementTagName>(v: any, type: T): v is ElementOfTagName<T>;
// export function isElement(v: any, type?: string): boolean {
//   return v instanceof Element && (!type || type === v.tagName.toLowerCase());
// }

export function elements(fn: Accessor<ResolvedJSXElement>): Accessor<Element[]>;
export function elements<T extends typeof Element[]>(
  fn: Accessor<ResolvedJSXElement>,
  ...types: T
): Accessor<InstanceType<ItemsOf<T>>[]>;
export function elements(
  fn: Accessor<ResolvedJSXElement>,
  ...types: typeof Element[]
): Accessor<Element[]> {
  return createMemo(() => filterInstance(asArray(fn()), ...(types.length ? types : [Element])));
}

/**
 * Get signal references to DOM Elements of the reactive input. Which Elements were added, which were removed.
 * @param fn JSX.Element signal
 * @returns `[current elements, added, removed]`
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#refs
 * @example
 * const [elements, added, removed] = refs(children(() => props.children));
 * elements() // => [<button>, <div>, ...]
 * added() // => [...]
 * removed() // => [...]
 */
export function refs(
  fn: Accessor<ResolvedJSXElement>
): [refs: Accessor<Element[]>, added: Accessor<Element[]>, removed: Accessor<Element[]>];
export function refs<T extends typeof Element[]>(
  fn: Accessor<ResolvedJSXElement>,
  ...types: T
): [
  refs: Accessor<InstanceType<ItemsOf<T>>[]>,
  added: Accessor<InstanceType<ItemsOf<T>>[]>,
  removed: Accessor<InstanceType<ItemsOf<T>>[]>
];
export function refs(
  fn: Accessor<ResolvedJSXElement>,
  ...types: typeof Element[]
): [refs: Accessor<Element[]>, added: Accessor<Element[]>, removed: Accessor<Element[]>] {
  const resolved = elements(fn, ...types);
  let prev: readonly Element[] = [];

  const memo = createMemo(() => {
    const list = resolved();
    const [added, removed] = getChangedItems(prev, list);
    prev = list;
    return { refs: list.slice(), added, removed };
  });

  return [() => memo().refs, () => memo().added, () => memo().removed];
}

/**
 * A directive that calls handler when the element get's unmounted from DOM.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#unmount
 */
export const unmount: Directive<Get<Element>> = (el, handler): void => {
  onCleanup(() => handler()(el));
};

/**
 * reactively map removed items from a reactive signal array. If the mapping function return an element signal, this element will be placed in the array returned from primitive.
 * @param list array source
 * @param mapFn function executed on elements removed from the source list. Return element to keep it in the array.
 * @returns array signal of elements from source + mapped removed elements
 * @example
 * const combined = mapRemoved(refs, (ref, i) => {
 *    const [el, setEl] = createSignal(ref);
 *    createEffect(() => {}) // you can create computations in the mapping function
 *    return el; // set the signal to undefined to remove it from array
 * });
 */
export function mapRemoved<T extends object>(
  list: Accessor<readonly T[]>,
  mapFn: (v: T, index: Accessor<number>) => Accessor<T | undefined> | undefined | void
): Accessor<T[]> {
  let prevList: T[] = [];
  const saved = new WeakSet<T>();
  const indexes = mapFn.length > 1 ? new WeakMap<T, Setter<number>>() : undefined;
  const owner = getOwner();
  const [items, setItems] = createSignal<T[]>([]);

  createComputed(
    on(list, _list => {
      const { length } = prevList;

      // fast path for empty new list
      if (!_list.length) {
        const list: T[] = [];
        for (let i = 0; i < length; i++) {
          const item = prevList[i];
          if (saved.has(item)) list.push(item);
          else mapRemovedElement(list, item, i);
        }
        return setItems((prevList = list));
      }

      const list = _list.slice();

      // fast path for empty prev list
      if (!length) return setItems((prevList = list));

      for (let i = 0, j = 0; i < length; i++, j++) {
        const item = prevList[i];
        // item already in both lists
        if (list.includes(item)) continue;
        // item saved from previous changes
        if (saved.has(item)) {
          while (list[j] && !prevList.includes(list[j]) && ++j) {}
          indexes?.get(item)?.(j);
          list.splice(j, 0, item);
        }
        // item removed in this change
        else mapRemovedElement(list, item, j);
      }

      setItems((prevList = list));
    })
  );

  let toRemove: T[] = [];
  const executeToRemove = () => {
    if (!toRemove.length) return;
    setItems(p => removeItems(p, ...toRemove));
    toRemove = [];
  };

  function mapRemovedElement(list: T[], item: T, i: number) {
    createSubRoot(dispose => {
      let signal: Accessor<T | undefined>, mapped: T;
      // create index signal
      if (indexes) {
        const [index, setIndex] = createSignal(i);
        const s = mapFn(item, index);
        const m = access(s);
        if (!m) return dispose();
        indexes.set(m, setIndex);
        (signal = s as Accessor<T | undefined>), (mapped = m);
      }
      // don't create index signal
      else {
        const s = (mapFn as any)(item);
        const m = access(s);
        if (!m) return dispose();
        (signal = s), (mapped = m);
      }

      saved.add(mapped);
      list.splice(i, 0, mapped);
      let prev: T = mapped;

      // prettier-ignore
      createComputed(on(signal, item => {
        saved.delete(prev)
        if (indexes) {
          const set = indexes.get(prev)
          indexes.delete(prev)
          if (item) set && indexes.set(item, set)
          else {
            const list = items()
            for (i = list.indexOf(prev); i < list.length; i++) {
              indexes.get(list[i])?.(p => --p)
            }
          }
        }
        // remove saved item if changed to undefined
        if (!item) {
          mutableRemove(prevList, prev);
          // batch setItems changes
          toRemove.push(prev);
          queueMicrotask(executeToRemove);
          return dispose();
        }
        saved.add(item);
        setItems(p => remove(p, prev, item));
        prev = item;
      }, { defer: true }));
    }, owner);
  }

  return items;
}

/**
 * Solid's `children` helper in component form. Access it's children elements by `get` property.
 * @property `get` – get resolved elements, fired every time the children change
 * @example
 * ```tsx
 * const [children, setChildren] = createSignal<ResolvedJSXElement>();
 *
 * <Children get={setChildren}>
 *    <div></div>
 *    ...
 * </Children>
 * ```
 */
export const Children = (props: {
  get: Get<ResolvedJSXElement>;
  children: JSX.Element;
}): Accessor<ResolvedJSXElement> => {
  const resolved = children(() => props.children);
  createComputed(on(resolved, props.get));
  onCleanup(() => props.get(undefined));
  return resolved;
};

/**
 * Get up-to-date references of the multiple children elements.
 * @param refs Getter of current array of elements
 * @param added Getter of added elements since the last change
 * @param removed Getter of removed elements since the last change
 * @param onChange handle children changes
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#Refs
 */
export const Refs = <E extends Element>(props: {
  refs?: Get<E[]>;
  added?: Get<E[]>;
  removed?: Get<E[]>;
  onChange?: Get<{ refs: E[]; added: E[]; removed: E[] }>;
  children: JSX.Element;
}): Accessor<ResolvedJSXElement> => {
  const resolved = children(() => props.children);
  const [elements, added, removed] = refs(resolved);

  const emit = (refs: E[], added: E[], removed: E[]) =>
    untrack(() => {
      props.refs?.(refs);
      props.added?.(added);
      props.removed?.(removed);
      props.onChange?.({ refs, added, removed });
    });

  createComputed(() => emit(elements() as E[], added() as E[], removed() as E[]));
  onCleanup(() => emit([], [], elements() as E[]));

  return resolved;
};

/**
 * Get up-to-date reference to a single child element.
 * @param ref Getter of current element *(or `undefined` if not mounted)*
 * @param onMount handle the child element getting mounted to the dom
 * @param onUnmount handle the child element getting unmounted from the dom
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#Ref
 */
export const Ref = <U extends Element>(props: {
  ref?: Get<U | undefined>;
  onMount?: Get<U>;
  onUnmount?: Get<U>;
  children: JSX.Element;
}): Accessor<ResolvedJSXElement> => {
  const resolved = children(() => props.children);
  let prev: U | undefined;

  createComputed(() => {
    const el = (() => {
      let el = access(resolved()) as U | undefined;
      if (!(el instanceof Element)) el = undefined;
      return el;
    })();

    untrack(() => {
      props.ref?.(el);
      if (el && prev !== el) onMount(() => props.onMount?.(el));
      if (prev && prev !== el && props.onUnmount) props.onUnmount(prev);
    });
    prev = el;
  });

  onCleanup(() => {
    if (prev) {
      props.ref?.(undefined);
      props.onUnmount?.(prev);
    }
  });

  return resolved;
};

/**
 * Causes the children to rerender when the `key` changes.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#Key
 */
export const Key: Component<{ key: any }> = props => {
  const key = createMemo(() => props.key);
  return createMemo(() => {
    key();
    return props.children;
  });
};
