import { describe, test, expect } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { OnMessageCB, createBroadcastChannel, makeBroadcastChannel } from "../src/index.js";

type MsgType = string;

const buildMockBroadcastChannel = (channelName: string) => {
  // Don't know how to open pages/tabs in order to test
  // BroadcastChannel sending messages across different pages.

  // Instead, we're making duplicated instance with same channel name.
  // After first channel is invoked, in the same context(page),
  // subsequent instances with same channel name will receive
  // message events if listening
  return new BroadcastChannel(channelName);
};

describe("makeBroadcastChannel", () => {
  test("checking instances from BroadcastChannel constructor", () =>
    createRoot(dispose => {
      const channelName = "channel-1";
      const { instance: instance1 } = makeBroadcastChannel(channelName);
      const { instance: instance2 } = makeBroadcastChannel(channelName);
      const { instance: instance3 } = makeBroadcastChannel("channel-5");

      expect(instance1).toBeInstanceOf(BroadcastChannel);
      expect(instance2).toBeInstanceOf(BroadcastChannel);
      expect(instance3).toBeInstanceOf(BroadcastChannel);

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);

      dispose();
    }));

  test("posting messages between pages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage } = makeBroadcastChannel<MsgType>(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          onMessage(({ data }) => {
            resolve(data);
          });

          mockedBCInstance.postMessage("hi");
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("hi");

      dispose();
    }));

  test("posting messages with single instance channel name but called makeBroadcastChannel multiple times", async () => {
    const channelName = "channel-1";
    const mockedBCInstance = buildMockBroadcastChannel(channelName);

    const { onMessage1, onMessage2, dispose } = createRoot(d => {
      const bc1 = makeBroadcastChannel<MsgType>(channelName);
      const bc2 = makeBroadcastChannel<MsgType>(channelName);

      return {
        onMessage1: bc1.onMessage,
        onMessage2: bc2.onMessage,
        dispose: d,
      };
    });

    const captured: string[] = [];

    const promise = new Promise<void>(resolve => {
      const handleMessage: OnMessageCB = e => {
        captured.push(e.data);
        if (captured.length === 2) resolve();
      };
      onMessage1(handleMessage);
      onMessage2(handleMessage);
    });

    mockedBCInstance.postMessage("hi");

    await promise;

    expect(captured).toEqual(["hi", "hi"]);

    dispose();
  });

  test("posting a message to separate channels", async () => {
    const channelName = "channel-1";
    const mockedBCInstance = buildMockBroadcastChannel(channelName);

    const data = createRoot(dispose => {
      const bc1 = makeBroadcastChannel<MsgType>(channelName);
      const bc2 = makeBroadcastChannel<MsgType>("channel-2");

      return { bc1, bc2, dispose };
    });

    const captured: string[] = [];
    let resolve: () => void;

    data.bc1.onMessage(e => {
      captured.push(e.data + "1");
      resolve();
    });
    data.bc2.onMessage(e => {
      captured.push(e.data + "2");
      resolve();
    });

    const promise = new Promise<void>(r => (resolve = r));
    mockedBCInstance.postMessage("hi");
    await promise;

    expect(captured).toEqual(["hi1"]);

    data.dispose();
  });

  test("sending messages", async () => {
    const channelName = "channel-1";

    const data = createRoot(dispose => {
      const bc1 = makeBroadcastChannel<MsgType>(channelName);
      const bc2 = makeBroadcastChannel<MsgType>(channelName);

      return { bc1, bc2, dispose };
    });

    let posted_message = "";

    data.bc1.onMessage(({ data }) => {
      posted_message += `${data}1`;
    });
    data.bc2.onMessage(({ data }) => {
      posted_message += `${data}2`;
    });

    data.bc1.postMessage("hi");
    data.bc2.postMessage("bye");

    await new Promise<void>(r => setTimeout(r, 100));

    expect(posted_message).toBe("");

    data.dispose();
  });
});

describe("createBroadcastChannel", () => {
  test("checking instances from BroadcastChannel constructor", () => {
    createRoot(dispose => {
      const channelName = "channel-1";
      const { instance: instance1 } = createBroadcastChannel<MsgType>(channelName);
      const { instance: instance2 } = createBroadcastChannel<MsgType>(channelName);
      const { instance: instance3 } = createBroadcastChannel<MsgType>("channel-5");

      expect(instance1).toBeInstanceOf(BroadcastChannel);
      expect(instance2).toBeInstanceOf(BroadcastChannel);
      expect(instance3).toBeInstanceOf(BroadcastChannel);

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);

      dispose();
    });
  });

  test("posting messages between pages", async () => {
    const channelName = "channel-1";
    const mockedBCInstance = buildMockBroadcastChannel(channelName);

    const captured: unknown[] = [];
    let resolve: () => void;

    const dispose = createRoot(dispose => {
      const { message } = createBroadcastChannel<MsgType>(channelName);

      createEffect(() => {
        captured.push(message());
        if (captured.length === 2) resolve();
      });

      return dispose;
    });

    const promise = new Promise<void>(r => (resolve = r));
    mockedBCInstance.postMessage("hi");
    await promise;

    expect(captured).toEqual([null, "hi"]);

    dispose();
  });

  test("posting messages with single instance channel name but called makeBroadcastChannel multiple times", async () => {
    const channelName = "channel-1";
    const mockedBCInstance = buildMockBroadcastChannel(channelName);

    let resolve1: ((m: unknown) => void) | undefined, resolve2: ((m: unknown) => void) | undefined;

    const dispose = createRoot(dispose => {
      const { message: message1 } = createBroadcastChannel<MsgType>(channelName);
      const { message: message2 } = createBroadcastChannel<MsgType>(channelName);

      createEffect(() => {
        const m = message1();
        resolve1?.(m);
      });

      createEffect(() => {
        const m = message2();
        resolve2?.(m);
      });

      return dispose;
    });

    mockedBCInstance.postMessage("hi");

    const captured: unknown[] = [];
    await new Promise<void>(r => {
      resolve1 = m => {
        captured.push(m + "1");
        if (captured.length === 2) r();
      };
      resolve2 = m => {
        captured.push(m + "2");
        if (captured.length === 2) r();
      };
    });

    expect(captured).toEqual(["hi1", "hi2"]);

    dispose();
  });
});
