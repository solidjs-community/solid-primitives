import { createSignal, JSX, onCleanup } from "solid-js";

type OnMessageCB = (e: MessageEvent<any>) => void;

type TBroadcastChannelInstance = {
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

export function makeBroadcastChannel(name: string) {
  if (process.env.SSR)
    return {
      onMessage: () => void 0,
      postMessage: () => void 0,
      close: () => void 0,
      channelName: name,
      instance: {} as unknown as BroadcastChannel
    };

  const id = Symbol();
  const foundInstance = map[name];
  let cbRef: any;

  const onMessage = (
    cb: (e: MessageEvent<any>) => void,
    options?: boolean | AddEventListenerOptions
  ) => {
    const { onMessageCBList, instance } = map[name]!;
    const bcObjectInstance = instance.instance;
    onMessageCBList.push({ id, cb });

    if (onMessageCBList.length >= 2) {
      return;
    }

    cbRef = (e: MessageEvent<any>) => {
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
        item => item.id !== id
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

    // return foundInstance.instance;
    return {
      onMessage,
      postMessage: foundInstance.instance.postMessage.bind(foundInstance.instance.instance),
      close,
      channelName: foundInstance.instance.channelName,
      instance: foundInstance.instance.instance
    };
  }

  const newInstance = {
    instanceCount: 1,
    onMessageCBList: [],
    instance: null as any
  } as TBroadcastChannelInstance;

  const instance = new BroadcastChannel(name);
  const { name: channelName, postMessage } = instance;

  const result = {
    onMessage,
    postMessage: postMessage.bind(instance),
    close,
    channelName,
    instance
  } as TBroadcastChannelInstance["instance"];
  newInstance.instance = result;
  map[name] = newInstance;

  return result;
}

export function createBroadcastChannel(name: string) {
  const [message, setMessage] = createSignal<unknown>(null);
  const { channelName, close, instance, onMessage, postMessage } = makeBroadcastChannel(name);

  onMessage(({ data }) => {
    setMessage(data);
  });

  return { message, postMessage: postMessage.bind(instance), channelName, instance, close };
}

// This ensures the `JSX` import won't fall victim to tree shaking before
// TypesScript can use it
export type E = JSX.Element;
