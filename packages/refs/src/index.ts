import {
  access,
  asArray,
  Directive,
  Get,
  isFunction,
  MaybeAccessor
} from "@solid-primitives/utils";
import {
  children,
  Component,
  ComponentProps,
  createComputed,
  createMemo,
  JSX,
  onCleanup,
  onMount,
  splitProps,
  untrack
} from "solid-js";
import { spread, Portal } from "solid-js/web";

declare module "solid-js" {
  namespace JSX {
    interface Directives {
      unmount: UnmountHandler;
    }
  }
}
export type E = JSX.Element;

export type UnmountHandler<E extends Element = Element> = Get<E>;

/**
 * A directive that calls handler when the element get's unmounted from DOM.
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#unmount
 */
export const unmount: Directive<UnmountHandler> = (el, handler): void => {
  onCleanup(() => handler()(el));
};

/**
 * Get up-to-date references of the multiple children elements.
 * @param refs Getter of current array of elements
 * @param added Getter of added elements since the last change
 * @param removed Getter of removed elements since the last change
 * @param onChange handle children changes
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#Refs
 */
export const Refs = <U extends Element>(props: {
  refs?: Get<U[]>;
  added?: Get<U[]>;
  removed?: Get<U[]>;
  onChange?: Get<{ refs: U[]; added: U[]; removed: U[] }>;
  children: JSX.Element;
}): JSX.Element => {
  const resolved = children(() => props.children);
  let prev: U[] = [];

  const emit = (refs: U[], added: U[], removed: U[]) => {
    props.refs?.(refs);
    props.added?.(added);
    props.removed?.(removed);
    props.onChange?.({ refs, added, removed });
  };

  createComputed(() => {
    const refs: U[] = [];
    const added: U[] = [];

    for (const el of asArray(resolved())) {
      if (!(el instanceof Element)) continue;
      const ref = el as U;
      refs.push(ref);
      const index = prev.indexOf(ref);
      if (index !== -1) prev.splice(index, 1);
      else added.push(ref);
    }

    untrack(() => emit(refs, added, prev));
    prev = refs.slice();
  });

  onCleanup(() => emit([], [], prev));

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
}): JSX.Element => {
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

/**
 * A Remote Element. Applies all JSX attributes, special attributes such as `style`, `classList`, event listeners and inserts passed children to the target `element`.
 * @param element target DOM element.
 * @param useShadow use the shadow dom for children
 * @param isSvg set to true if the target element is a part of an svg
 * @see https://github.com/davedbase/solid-primitives/tree/main/packages/refs#Remote
 */
export const Remote = <T extends keyof JSX.IntrinsicElements>(
  props: ComponentProps<T> & {
    element: MaybeAccessor<Element>;
    useShadow?: boolean;
    isSvg?: boolean;
    children?: JSX.Element;
  }
): JSX.Element => {
  const [p, others] = splitProps(props, ["element", "children", "useShadow", "isSvg"]);

  const run = () => {
    const el = access(p.element);
    if (!el) return;
    spread(el, others, !!p.isSvg);
    if (p.children) Portal({ ...p, mount: el, children: p.children });
  };
  isFunction(p.element) ? onMount(run) : run();

  return document.createTextNode("");
};
