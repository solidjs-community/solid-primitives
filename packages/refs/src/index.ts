import { filterInstance, remove, removeItems } from "@solid-primitives/immutable";
import { createSubRoot } from "@solid-primitives/rootless";
import {
  access,
  asArray,
  Directive,
  ExtractIfPossible,
  ItemsOf,
  Many,
} from "@solid-primitives/utils";
import {
  Accessor,
  children,
  createComputed,
  createMemo,
  createSignal,
  JSX,
  on,
  onCleanup,
  onMount,
  untrack,
  getOwner,
  Setter,
} from "solid-js";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      unmount: (el: Element) => void;
    }
  }
}
export type E = JSX.Element;

/**
 * Component properties with types for `ref`
 * ```ts
 * {
 *    ref?: Element | ((el: Element) => void);
 * }
 * ```
 */
export interface RefProps<T extends Element> {
  ref?: T | ((el: T) => void);
}

/**
 * Type of resolved JSX elements provided by Solid's `children` helper.
 */
export type ResolvedChildren = ReturnType<ReturnType<typeof children>>;

/**
 * Utility for using jsx refs both for local variables and providing it to the `props.ref` for component consumers.
 * @param setRef use this to set local variables
 * @param propsRef for forwarding the ref to `props.ref`
 * @example
 * ```tsx
 * interface ButtonProps {
 *    ref?: HTMLButtonElement | ((el: HTMLButtonElement) => void);
 * }
 * const Button = (props: ButtonProps) => {
 *    let ref!: HTMLButtonElement
 *    onMount(() => {
 *        // use the local ref
 *    })
 *    return <button ref={mergeRefs(el => (ref = el), props.ref)} />
 * }
 *
 * // in consumer's component:
 * let ref!: HTMLButtonElement
 * <Button ref={ref} />
 * ```
 */
export function mergeRefs<T extends Element>(
  setRef: (el: T) => void,
  propsRef: T | ((el: T) => void) | undefined,
): (el: T) => void {
  return el => {
    setRef(el);
    (propsRef as ((el: T) => void) | undefined)?.(el);
  };
}

const mutableRemove = <T>(list: T[], item: T): void => {
  const index = list.indexOf(item);
  list.splice(index, 1);
};

/**
 * Which elements got added to the array, and which got removed?
 * @param prevList Array before change
 * @param list Array after change
 * @returns `[added items, removed items]`
 */
export function getChangedItems<T>(
  prevList: readonly T[],
  list: readonly T[],
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
/**
 * Which elements got added to the array?
 * @param prevList Array before change
 * @param list Array after change
 * @returns list of added items
 */
export const getAddedItems = <T>(prevList: readonly T[], list: readonly T[]): T[] =>
  list.filter(item => !prevList.includes(item));
/**
 * Which elements got removed from the array?
 * @param prevList Array before change
 * @param list Array after change
 * @returns list of removed items
 */
export const getRemovedItems = <T>(prevList: readonly T[], list: readonly T[]): T[] =>
  prevList.filter(item => !list.includes(item));

/**
 * Similarly to `children()` helper from `solid-js` will resolve provided {@link value} to a flat list of HTML elements or a single element or `null`. But doesn't create a computation.
 * @param value value to be resolved
 * @returns ```ts
 * HTMLElement | HTMLElement[] | null
 * ```
 */
export function resolveElements(value: unknown): HTMLElement | HTMLElement[] | null {
  let resolved = getResolvedElements(value);
  if (Array.isArray(resolved) && !resolved.length) resolved = null;
  return resolved;
}
function getResolvedElements(value: unknown): HTMLElement | HTMLElement[] | null {
  if (typeof value === "function" && !value.length) return getResolvedElements(value());
  if (Array.isArray(value)) {
    const results: HTMLElement[] = [];
    for (const item of value) {
      const result = getResolvedElements(item);
      if (result)
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
    }
    return results;
  }
  return value instanceof HTMLElement ? value : null;
}

/**
 * Reactive signal that filters out non-element items from a signal array.
 * @param fn Array signal
 * @returns Array signal
 * @example
 * const resolved = children(() => props.children);
 * const refs = elements(resolved);
 * refs() // T: Element[]
 * // or narrow down type of the Element
 * const refs = elements(resolved, HTMLElement);
 * refs() // T: HTMLElement[]
 */
export function elements<S>(fn: Accessor<Many<S>>): Accessor<ExtractIfPossible<S, Element>[]>;
export function elements<S, T extends (typeof Element)[]>(
  fn: Accessor<Many<S>>,
  ...types: T
): Accessor<ExtractIfPossible<S, InstanceType<ItemsOf<T>>>[]>;
export function elements(fn: Accessor<any>, ...types: (typeof Element)[]): Accessor<Element[]> {
  return createMemo(() => filterInstance(asArray(fn()), ...(types.length ? types : [Element])));
}

/**
 * Get signal references to DOM Elements of the reactive input. Which Elements were added, which were removed.
 * @param fn JSX.Element signal
 * @returns `[current elements, added, removed]`
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/refs#refs
 * @example
 * const [elements, added, removed] = refs(children(() => props.children));
 * elements() // => [<button>, <div>, ...]
 * added() // => [...]
 * removed() // => [...]
 */
export function refs<S>(
  fn: Accessor<Many<S>>,
): [
  refs: Accessor<ExtractIfPossible<S, Element>[]>,
  added: Accessor<ExtractIfPossible<S, Element>[]>,
  removed: Accessor<ExtractIfPossible<S, Element>[]>,
];
export function refs<S, T extends (typeof Element)[]>(
  fn: Accessor<Many<S>>,
  ...types: T
): [
  refs: Accessor<ExtractIfPossible<S, InstanceType<ItemsOf<T>>>[]>,
  added: Accessor<ExtractIfPossible<S, InstanceType<ItemsOf<T>>>[]>,
  removed: Accessor<ExtractIfPossible<S, InstanceType<ItemsOf<T>>>[]>,
];
export function refs(
  fn: Accessor<any>,
  ...types: (typeof Element)[]
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
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/refs#unmount
 */
export const unmount: Directive<(el: Element) => void> = (el, handler): void => {
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
export function mapRemoved<T>(
  list: Accessor<Many<T>>,
  mapFn: (v: T, index: Accessor<number>) => Accessor<T | undefined> | undefined | void,
): Accessor<T[]> {
  let prevList: T[] = [];
  const saved = new Set<T>();
  const indexes = mapFn.length > 1 ? new Map<T, Setter<number>>() : undefined;
  const owner = getOwner();
  const [items, setItems] = createSignal<T[]>([]);

  createComputed(
    on(list, _list => {
      const { length } = prevList;
      const newList = asArray(_list).slice();

      // fast path for empty prev list
      if (!length) return setItems((prevList = newList));

      for (let pi = 0, ni = 0; pi < length; ) {
        const item = prevList[pi]!;
        // item already in both lists
        if (newList.includes(item)) pi++, ni++;
        // item saved from previous changes
        else if (saved.has(item)) {
          const x = prevList.indexOf(newList[ni]!);
          if (x !== -1 && x <= pi) ni++;
          else {
            newList.splice(ni, 0, item);
            indexes?.get(item)?.(ni);
            pi++;
          }
        }
        // item removed in this change
        else mapRemovedElement(newList, item, pi), pi++;
      }

      setItems((prevList = newList));
    }),
  );

  let toRemove: T[] = [];
  const executeToRemove = () => {
    if (!toRemove.length) return;
    setItems(p => removeItems(p, ...toRemove));
    toRemove = [];
  };

  function mapRemovedElement(newList: T[], item: T, i: number) {
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
      newList.splice(i, 0, mapped);
      let prev: T = mapped;

      // prettier-ignore
      createComputed(on(signal, signalValue => {
        saved.delete(prev)
        if (indexes) {
          const set = indexes.get(prev)
          indexes.delete(prev)
          if (signalValue) set && indexes.set(signalValue, set)
          else {
            const listValue = items()
            for (i = listValue.indexOf(prev); i < listValue.length; i++) {
              indexes.get(listValue[i]!)?.(p => --p)
            }
          }
        }
        // remove saved item if changed to undefined
        if (!signalValue) {
          mutableRemove(prevList, prev);
          // batch setItems changes
          toRemove.push(prev);
          queueMicrotask(executeToRemove);
          return dispose();
        }
        saved.add(signalValue);
        setItems(p => remove(p, prev, signalValue));
        prev = signalValue;
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
  get: (resolved: ResolvedChildren) => void;
  children: JSX.Element;
}): Accessor<ResolvedChildren> => {
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
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/refs#Refs
 */
export const Refs = <El extends Element>(props: {
  refs?: (els: El[]) => void;
  added?: (els: El[]) => void;
  removed?: (els: El[]) => void;
  onChange?: (changed: { refs: El[]; added: El[]; removed: El[] }) => void;
  children: JSX.Element;
}): Accessor<ResolvedChildren> => {
  const resolved = children(() => props.children);

  // calculate changed elements only if user listens for it
  if (props.added || props.removed || props.onChange) {
    const [elementList, added, removed] = refs(resolved);
    const emit = (refValue: El[], addedValue: El[], removedValue: El[]) =>
      untrack(() => {
        props.refs?.(refValue);
        props.added?.(addedValue);
        props.removed?.(removedValue);
        props.onChange?.({ refs: refValue, added: addedValue, removed: removedValue });
      });
    createComputed(() => emit(elementList() as El[], added() as El[], removed() as El[]));
    onCleanup(() => emit([], [], elementList() as El[]));
  }
  // or emit only the current elements
  else if (props.refs) {
    const cb = props.refs;
    const refList = elements(resolved);
    createComputed(() => cb(refList() as El[]));
    onCleanup(() => cb([]));
  }

  return resolved;
};

/**
 * Get up-to-date reference to a single child element.
 * @param ref Getter of current element *(or `undefined` if not mounted)*
 * @param onMount handle the child element getting mounted to the dom
 * @param onUnmount handle the child element getting unmounted from the dom
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/refs#Ref
 */
export const Ref = <U extends Element>(props: {
  ref?: (el: U | undefined) => void;
  onMount?: (el: U) => void;
  onUnmount?: (el: U) => void;
  children: JSX.Element;
}): Accessor<ResolvedChildren> => {
  const resolved = children(() => props.children);
  let prev: U | undefined;

  createComputed(() => {
    const el = (() => {
      let newEl = access(resolved()) as U | undefined;
      if (!(newEl instanceof Element)) newEl = undefined;
      return newEl;
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
