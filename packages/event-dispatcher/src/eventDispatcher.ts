import { create_custom_evt, get_event_listener_name } from "./utils"

type Handlers<T> = {
  [Property in keyof T as Property extends `on${infer EventName}` ? Uncapitalize<EventName> : never]: T[Property]
}

type DispatcherOptions = {
  cancelable: boolean,
}

export function createEventDispatcher<Props>(props: Props) {
  return function<N extends keyof Handlers<Props> & string>(
    ...args: Handlers<Props>[N] extends (undefined | ((evt?: CustomEvent<infer D> | undefined) => any)) ?
    // this will handle typing for callbacks with optional payloads like (e.g. onMyEvent: (evt?: CustomEvent<string> => void))
    [
        eventName: N,
        payload?: D | undefined,
        dispatcherOptions?: DispatcherOptions,
      ]
    : Handlers<Props>[N] extends (undefined | ((evt: CustomEvent<infer D>) => any)) ?
      // this will handle typing where the payload is not nullable (e.g. onMyEvent: (evt: CustomEvent<string> => void))
      [
        eventName: N,
        payload: D,
        dispatcherOptions?: DispatcherOptions,
      ]
    :
      // this will handle callabcks with no arguments (e.g. onMyEvent: () => void)
      [
        eventName: N,
        payload?: any,
        dispatcherOptions?: DispatcherOptions,
      ]
  ): boolean {
    const [eventName, payload, dispatcherOptions] = args
    const propName = get_event_listener_name(eventName) as string & keyof Props
    const handler = props[propName]

    if (typeof handler !== 'function') return true

    const customEvt = create_custom_evt(eventName, payload, dispatcherOptions?.cancelable ?? false)
    handler(customEvt)

    return !customEvt.defaultPrevented
  }
}