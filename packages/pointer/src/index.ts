import { createEventListener } from "@solid-primitives/event-listener";
import { remove, split } from "@solid-primitives/immutable";
import { createSubRoot } from "@solid-primitives/rootless";
import { Directive, entries, Many, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createSignal, getOwner, DEV } from "solid-js";
import { isServer } from "solid-js/web";
import { DEFAULT_STATE, parseHandlersMap, toState, toStateActive } from "./helpers";
import {
  Handler,
  OnEventRecord,
  PointerEventNames,
  PointerHoverDirectiveProps,
  PointerListItem,
  PointerPositionDirectiveProps,
  PointerStateWithActive,
  PointerType,
} from "./types";

export { getPositionToElement } from "./helpers";
export type {
  PointerHoverDirectiveHandler,
  PointerHoverDirectiveProps,
  PointerListItem,
  PointerPositionDirectiveHandler,
  PointerPositionDirectiveProps,
  PointerState,
  PointerStateWithActive,
  PointerType,
} from "./types";

/**
 * Setups event listeners for pointer events, that will get automatically removed on cleanup.
 * @param config event handlers, target, and chosen pointer types
 * - `target` - specify the target to attach the listeners to. Will default to `document.body`
 * - `pointerTypes` - specify array of pointer types you want to listen to. By default listens to `["mouse", "touch", "pen"]`
 * - `passive` - Add passive option to event listeners. Defaults to `true`.
 * - your event handlers: e.g. `onenter`, `onLeave`, `onMove`, ...
 * @returns function stopping currently attached listener **!deprecated!**
 *
 * @example
 * createPointerListeners({
 *    // pass a function if the element is yet to mount
 *    target: () => el,
 *    pointerTypes: ["touch"],
 *    onEnter: e => console.log("enter", e.x, e.y),
 *    onmove: e => console.log({ x: e.x, y: e.y }),
 *    onup: e => console.log("pointer up", e.x, e.y),
 *    onLostCapture: e => console.log("lost")
 * });
 */
export function createPointerListeners(
  config: Partial<OnEventRecord<PointerEventNames, Handler>> & {
    target?: MaybeAccessor<EventTarget | undefined>;
    pointerTypes?: PointerType[];
    passive?: boolean;
  },
): void {
  if (isServer) {
    return;
  }

  const [{ target = document.body, pointerTypes, passive = true }, handlers] = split(
    config,
    "target",
    "pointerTypes",
    "passive",
  );
  const [{ gotcapture: onGotCapture, lostcapture: onLostCapture }, nativeHandlers] = split(
    parseHandlersMap(handlers),
    "gotcapture",
    "lostcapture",
  );

  const guardCB = (handler: Handler) => (event: PointerEvent) =>
    (!pointerTypes || pointerTypes.includes(event.pointerType as PointerType)) && handler(event);
  const addEventListener = (type: Many<keyof HTMLElementEventMap>, fn: Handler) =>
    createEventListener(target, type, guardCB(fn) as any, { passive });

  entries(nativeHandlers).forEach(
    ([name, fn]) => fn && addEventListener(`pointer${name}` as keyof HTMLElementEventMap, fn),
  );
  if (onGotCapture) addEventListener("gotpointercapture", onGotCapture);
  if (onLostCapture) addEventListener("lostpointercapture", onLostCapture);
}

/**
 * Setup pointer event listeners, while following the pointers individually, from when they appear, until they're gone.
 * @param config primitive configuration:
 * - `target` - specify the target to attach the listeners to. Will default to `document.body`
 * - `pointerTypes` - specify array of pointer types you want to listen to. By default listens to `["mouse", "touch", "pen"]`
 * - `passive` - Add passive option to event listeners. Defaults to `true`.
 * - `onDown` - Start following a pointer from when it's down.
 * - `onEnter` - Start following a pointer from when it enters the screen.
 * @see https://github.com/solidjs-community/solid-primitives/tree/main/packages/pointer#createPerPointerListeners
 * @example
 * createPerPointerListeners({
 *    target: el,
 *    pointerTypes: ['touch', 'pen'],
 *    onDown({ x, y, pointerId }, onMove, onUp) {
 *        console.log(x, y, pointerId);
 *        onMove(e => {...});
 *        onUp(e => {...});
 *    }
 * })
 */
export function createPerPointerListeners(
  config: {
    target?: MaybeAccessor<EventTarget>;
    pointerTypes?: PointerType[];
    passive?: boolean;
  } & Partial<
    OnEventRecord<
      "enter",
      (
        event: PointerEvent,
        handlers: Readonly<
          OnEventRecord<"down" | "move" | "up" | "leave" | "cancel", (handler: Handler) => void>
        >,
      ) => void
    > &
      OnEventRecord<
        "down",
        (
          event: PointerEvent,
          onMove: (handler: Handler) => void,
          onUp: (handler: Handler) => void,
        ) => void
      >
  >,
) {
  if (isServer) {
    return;
  }

  const [{ target = document.body, pointerTypes, passive = true }, handlers] = split(
    config,
    "pointerTypes",
    "target",
    "passive",
  );
  const { down: onDown, enter: onEnter } = parseHandlersMap(handlers);
  const owner = getOwner();
  const onlyInitMessage = "All listeners need to be added synchronously in the initial event.";
  const addListener = (type: Many<string>, fn: Handler, pointerId?: number): void =>
    createEventListener(
      target,
      type,
      ((e: PointerEvent) =>
        (!pointerTypes || pointerTypes.includes(e.pointerType as PointerType)) &&
        (!pointerId || e.pointerId === pointerId) &&
        fn(e)) as any,
      { passive },
    );

  if (onEnter) {
    const handleEnter = (e: PointerEvent) => {
      createSubRoot(dispose => {
        const { pointerId } = e;
        let init = true;
        let onLeave: Handler | undefined;

        addListener(
          "pointerleave",
          e => {
            onLeave?.(e);
            dispose();
          },
          pointerId,
        );

        onEnter(
          e,
          new Proxy(
            {},
            {
              get: (_, key: string) => {
                const type = "pointer" + key.substring(2).toLowerCase();
                return (fn: Handler) => {
                  if (!init) {
                    // eslint-disable-next-line no-console
                    if (!isServer && DEV) console.warn(onlyInitMessage);
                    return;
                  }
                  if (type === "pointerleave") onLeave = fn;
                  else addListener(type, fn, pointerId);
                };
              },
            },
          ) as any,
        );
        init = false;
      }, owner);
    };
    addListener("pointerenter", handleEnter);
  }

  if (onDown) {
    const handleDown = (e: PointerEvent) => {
      createSubRoot(dispose => {
        const { pointerId } = e;
        let init = true;
        let onUp: Handler | undefined;

        addListener(
          ["pointerup", "pointercancel"],
          e => {
            onUp?.(e);
            dispose();
          },
          pointerId,
        );

        onDown(
          e,
          // onMove()
          fn => {
            if (init) addListener("pointermove", fn, pointerId);
            // eslint-disable-next-line no-console
            else if (!isServer && DEV) console.warn(onlyInitMessage);
          },
          // onUp()
          fn => {
            if (init) onUp = fn;
            // eslint-disable-next-line no-console
            else if (!isServer && DEV) console.warn(onlyInitMessage);
          },
        );
        init = false;
      }, owner);
    };
    addListener("pointerdown", handleDown);
  }
}

/**
 * Returns a signal with autoupdating Pointer position.
 * @param config primitive config:
 * - `target` - specify the target to attach the listeners to. Will default to `document.body`
 * - `pointerTypes` - specify array of pointer types you want to listen to. By default listens to `["mouse", "touch", "pen"]`
 * - `value` - set the initial value of the returned signal *(before the first event)*
 * @returns position signal
 *
 * @example
 * const position = createPointerPosition({
 *    target: document.querySelector('my-el'),
 *    pointerTypes: ["touch"]
 * });
 */
export function createPointerPosition(
  config: {
    target?: MaybeAccessor<EventTarget>;
    pointerTypes?: PointerType[];
    value?: PointerStateWithActive;
  } = {},
): Accessor<PointerStateWithActive> {
  if (isServer) {
    return () => DEFAULT_STATE;
  }

  const [state, setState] = createSignal(config.value ?? DEFAULT_STATE);
  let pointer: null | number = null;
  const handler = (e: PointerEvent, active = true) => setState(toStateActive(e, active));
  createPointerListeners({
    ...config,
    onEnter: e => {
      if (pointer === null) {
        pointer = e.pointerId;
        handler(e);
      }
    },
    onMove: e => {
      if (e.pointerId === pointer) handler(e);
    },
    onLeave: e => {
      if (e.pointerId === pointer) {
        pointer = null;
        handler(e, false);
      }
    },
  });
  return state;
}

/**
 * Provides a signal of current pointers on screen.
 * @param config primitive config:
 * - `target` - specify the target to attach the listeners to. Will default to `document.body`
 * - `pointerTypes` - specify array of pointer types you want to listen to. By default listens to `["mouse", "touch", "pen"]`
 * @returns list of pointers on the screen
 * ```
 * Accessor<Accessor<PointerListItem>[]>
 * ```
 * @example
 * ```tsx
 * const points = createPointerList();
 * 
*  <For each={points()}>
    {poz => <div>{poz()}</div>}
  </For>
  ```
 */
export function createPointerList(
  config: {
    target?: MaybeAccessor<EventTarget>;
    pointerTypes?: PointerType[];
  } = {},
): Accessor<Accessor<PointerListItem>[]> {
  if (isServer) {
    return () => [];
  }

  const [pointers, setPointers] = createSignal<Accessor<PointerListItem>[]>([]);
  createPerPointerListeners({
    ...config,
    onEnter(e, { onMove, onDown, onUp, onLeave }) {
      const [pointer, setPointer] = createSignal<PointerListItem>({
        ...toState(e),
        isDown: false,
      });
      setPointers(p => [...p, pointer]);
      onMove(e => setPointer(p => ({ ...toState(e), isDown: p.isDown })));
      onDown(e => setPointer({ ...toState(e), isDown: true }));
      onUp(e => setPointer({ ...toState(e), isDown: false }));
      onLeave(() => setPointers(p => remove(p, pointer)));
    },
  });
  return pointers;
}

//
// DIRECTIVES:
//

/**
 * A directive that will fire a callback once the pointer position change.
 */
export const pointerPosition: Directive<PointerPositionDirectiveProps> = (el, props) => {
  const { pointerTypes, handler } = (() => {
    const v = props();
    return typeof v === "function" ? { handler: v, pointerTypes: undefined } : v;
  })();
  const runHandler = (e: PointerEvent, active = true) => handler(toStateActive(e, active), el);
  let pointer: null | number = null;
  createPointerListeners({
    target: el,
    pointerTypes,
    onEnter: e => {
      if (pointer === null) {
        pointer = e.pointerId;
        runHandler(e);
      }
    },
    onMove: e => {
      if (e.pointerId === pointer) runHandler(e);
    },
    onLeave: e => {
      if (e.pointerId === pointer) {
        pointer = null;
        runHandler(e, false);
      }
    },
  });
};

/**
 * A directive for checking if the element is being hovered by at least one pointer.
 */
export const pointerHover: Directive<PointerHoverDirectiveProps> = (el, props) => {
  const { pointerTypes, handler } = (() => {
    const v = props();
    return typeof v === "function" ? { handler: v, pointerTypes: undefined } : v;
  })();
  const pointers = new Set<number>();
  createPointerListeners({
    target: el as HTMLElement,
    pointerTypes: pointerTypes,
    onEnter: e => {
      pointers.add(e.pointerId);
      handler(true, el);
    },
    onLeave: e => {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) handler(false, el);
    },
  });
};
