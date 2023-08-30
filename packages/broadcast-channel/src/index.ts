import { createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

export type OnMessageCB = (e: MessageEvent) => void;

export type TBroadcastChannelInstance = {
  onMessageCBList: { id: Symbol; cb: OnMessageCB }[];
  instanceCount: number;
  instance: {
    onMessage: (cb: OnMessageCB, options?: boolean | AddEventListenerOptions) => void;
    postMessage: (props: any) => void;
    close: () => void;
    channelName: string;
    instance: BroadcastChannel;
  };
};
const map: {
  [key: string]: TBroadcastChannelInstance;
} = {};

/**
 * Creates a new [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) instance for cross-tab communication.
 *
 * The channel name is used to identify the channel. If a channel with the same name already exists, it will be returned instead of creating a new one.
 *
 * Channel attempt closing the channel when the on owner cleanup. If there are multiple connected instances, the channel will not be closed until the last owner is removed.
 *
 * @param name channel name
 * @returns an object
 * - `onMessage` - a function to subscribe to messages from other tabs
 * - `postMessage` - a function to send messages to other tabs
 * - `close` - a function to close the channel
 * - `channelName` - the name of the channel
 * - `instance` - the underlying [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) instance
 */
export function makeBroadcastChannel<T>(name: string) {
  if (isServer)
    return {
      onMessage: () => void 0,
      postMessage: () => void 0 as unknown as (props: T) => void,
      close: () => void 0,
      channelName: name,
      instance: {} as unknown as BroadcastChannel,
    };

  const id = Symbol();
  const foundInstance = map[name];
  let cbRef: any;

  const onMessage = (
    cb: (e: MessageEvent<T>) => void,
    options?: boolean | AddEventListenerOptions,
  ) => {
    const { onMessageCBList, instance } = map[name]!;
    const bcObjectInstance = instance.instance;
    onMessageCBList.push({ id, cb });

    if (onMessageCBList.length >= 2) {
      return;
    }

    cbRef = (e: MessageEvent<T>) => {
      const { onMessageCBList } = map[name]!;
      onMessageCBList.forEach(item => {
        item.cb(e);
      });
    };

    bcObjectInstance.addEventListener("message", cbRef, options);
  };

  const close = () => {
    const currentInstance = map[name];
    if (!currentInstance) return;

    const willClose = currentInstance.instanceCount <= 1;

    if (!willClose) {
      currentInstance.instanceCount = currentInstance.instanceCount - 1;
      currentInstance.onMessageCBList = currentInstance.onMessageCBList.filter(
        item => item.id !== id,
      );
      return;
    }

    const bcObjectInstance = currentInstance.instance.instance;
    bcObjectInstance.close();
    bcObjectInstance.removeEventListener("message", cbRef);
    map[name] = null as unknown as any;
  };

  onCleanup(close);

  if (foundInstance) {
    foundInstance.instanceCount += 1;

    return {
      onMessage,
      postMessage: foundInstance.instance.postMessage.bind(foundInstance.instance.instance) as (
        props: T,
      ) => void,
      close,
      channelName: foundInstance.instance.channelName,
      instance: foundInstance.instance.instance,
    };
  }

  const newInstance = {
    instanceCount: 1,
    onMessageCBList: [],
    instance: null as any,
  } as TBroadcastChannelInstance;

  const instance = new BroadcastChannel(name);
  const { name: channelName, postMessage } = instance;

  const result = {
    onMessage,
    postMessage: postMessage.bind(instance),
    close,
    channelName,
    instance,
  };

  newInstance.instance = result;
  map[name] = newInstance;

  return result;
}

/**
 * Creates a new [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) instance for cross-tab communication.
 *
 * The channel name is used to identify the channel. If a channel with the same name already exists, it will be returned instead of creating a new one.
 *
 * Channel attempt closing the channel when the on owner cleanup. If there are multiple connected instances, the channel will not be closed until the last owner is removed.
 *
 * @param name channel name
 * @returns an object
 * - `message` - a singal accessor with last saved message
 * - `postMessage` - a function to send messages to other tabs
 * - `close` - a function to close the channel
 * - `channelName` - the name of the channel
 * - `instance` - the underlying [BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API) instance
 */
export function createBroadcastChannel<T>(name: string) {
  const [message, setMessage] = createSignal<T | null>(null);
  const { channelName, close, instance, onMessage, postMessage } = makeBroadcastChannel<T>(name);

  onMessage(({ data }) => {
    setMessage(() => data);
  });

  return { message, postMessage: postMessage.bind(instance), channelName, instance, close };
}
