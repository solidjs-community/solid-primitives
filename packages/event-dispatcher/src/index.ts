import { isServer } from "solid-js/web";

export type Handlers<T> = {
  [Property in keyof T as Property extends `on${infer EventName}`
    ? Uncapitalize<EventName>
    : never]: T[Property];
};

export type DispatcherOptions = {
  cancelable?: boolean;
};

/**
 * Creates a typed `CustomEvent` dispatcher for emitting events.
 * @returns dispatcher that will create a DOM custom event (`CustomEvent<T>`) and call the associated event handler
 *
 * The dispatcher takes three arguments:
 * @param eventName the event name in lower camel case. E.g, `customMessage`. When dispatching the event, the dispatcher will look for the "`on`+ upper camel case name in the props (`onCustomMessage`)
 * @param payload the payload associated to the event. This value is optional, and will be accessible in the `CustomEvent.detail` property
 * @param options the dispatcherOptions is an object with one property, `cancelable`, which determines whether the created custom event is cancelable (meaning its `preventDefault()` method can be called). This arguments is optional and defaults to `{ cancelable: false }`.
 */
export function createEventDispatcher<Props>(props: Props): <
  N extends keyof Handlers<Props> & string,
>(
  ...args: Handlers<Props>[N] extends undefined | ((evt?: CustomEvent<infer D> | undefined) => any)
    ? // this will handle typing for callbacks with optional payloads like (e.g. onMyEvent: (evt?: CustomEvent<string> => void))
      [eventName: N, payload?: D | undefined, dispatcherOptions?: DispatcherOptions]
    : Handlers<Props>[N] extends undefined | ((evt: CustomEvent<infer D>) => any)
    ? // this will handle typing where the payload is not nullable (e.g. onMyEvent: (evt: CustomEvent<string> => void))
      [eventName: N, payload: D, dispatcherOptions?: DispatcherOptions]
    : // this will handle callbacks with no arguments (e.g. onMyEvent: () => void)
      [eventName: N, payload?: any, dispatcherOptions?: DispatcherOptions]
) => boolean {
  if (isServer) {
    return () => false;
  }
  return function <N extends keyof Handlers<Props> & string>(
    ...args: Handlers<Props>[N] extends
      | undefined
      | ((evt?: CustomEvent<infer D> | undefined) => any)
      ? // this will handle typing for callbacks with optional payloads like (e.g. onMyEvent: (evt?: CustomEvent<string> => void))
        [eventName: N, payload?: D | undefined, dispatcherOptions?: DispatcherOptions]
      : Handlers<Props>[N] extends undefined | ((evt: CustomEvent<infer D>) => any)
      ? // this will handle typing where the payload is not nullable (e.g. onMyEvent: (evt: CustomEvent<string> => void))
        [eventName: N, payload: D, dispatcherOptions?: DispatcherOptions]
      : // this will handle callbacks with no arguments (e.g. onMyEvent: () => void)
        [eventName: N, payload?: any, dispatcherOptions?: DispatcherOptions]
  ): boolean {
    const [eventName, detail, { cancelable = false } = {}] = args;
    const propName = `${"on"}${eventName[0]!.toUpperCase()}${eventName.slice(1)}` as keyof Props;
    const handler = props[propName];

    if (typeof handler !== "function") return true;

    const customEvt = new CustomEvent(eventName, { detail, cancelable });
    handler(customEvt);

    return !customEvt.defaultPrevented;
  };
}
