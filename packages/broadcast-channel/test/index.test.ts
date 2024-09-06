import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { createEffect, createRoot } from "solid-js";
import { createBroadcastChannel, makeBroadcastChannel } from "../src/index.js";

/*
Mock BroadcastChannel for testing
postMessage is synchronous so we can test it immediately
This is to avoid relying on promises and timeouts
as those are flaky in CI
*/

const _all_listeners: Record<string, ((message: MessageEvent) => void)[][]> = {};

class BroadcastChannel {
  listeners: ((message: MessageEvent) => void)[];
  channel_name: string;

  constructor(channel_name: string) {
    this.channel_name = channel_name;
    this.listeners = [];
    if (!_all_listeners[channel_name]) {
      _all_listeners[channel_name] = [this.listeners];
    } else {
      _all_listeners[channel_name]!.push(this.listeners);
    }
  }

  postMessage(message: any) {
    const event = new MessageEvent("message", { data: message });
    for (const listeners of _all_listeners[this.channel_name]!) {
      if (listeners === this.listeners) continue;
      for (const l of listeners) {
        l(event);
      }
    }
  }
  addEventListener(type: string, listener: (message: MessageEvent) => void) {
    if (type === "message") {
      this.listeners.push(listener);
    }
  }
  removeEventListener(type: string, listener: (message: MessageEvent) => void) {
    if (type === "message") {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) {
        this.listeners.splice(index, 1);
      }
    }
  }
  close() {
    this.listeners.length = 0;
  }
}
const _original_broadcast_channel = BroadcastChannel;

beforeAll(() => {
  (global as any).BroadcastChannel = BroadcastChannel;
});
afterAll(() => {
  (global as any).BroadcastChannel = _original_broadcast_channel;
});

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

  test("posting messages between pages", () => {
    const channelName = "channel-1";
    const mockedBCInstance = buildMockBroadcastChannel(channelName);

    const { bc, dispose } = createRoot(dispose => {
      const bc = makeBroadcastChannel<MsgType>(channelName);
      return { bc, dispose };
    });

    let posted_message = "";
    bc.onMessage(({ data }) => {
      posted_message += data;
    });

    mockedBCInstance.postMessage("hi");
    expect(posted_message).toBe("hi");

    dispose();
  });

  test("posting messages with single instance channel name but called makeBroadcastChannel multiple times", () => {
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

    onMessage1(e => {
      captured.push(e.data);
    });
    onMessage2(e => {
      captured.push(e.data);
    });

    mockedBCInstance.postMessage("hi");
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

    data.bc1.onMessage(e => {
      captured.push(e.data + "1");
    });
    data.bc2.onMessage(e => {
      captured.push(e.data + "2");
    });

    mockedBCInstance.postMessage("hi");
    expect(captured).toEqual(["hi1"]);

    data.dispose();
  });

  test("sending messages", async t => {
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

    const dispose = createRoot(dispose => {
      const { message } = createBroadcastChannel<MsgType>(channelName);

      createEffect(() => {
        captured.push(message());
      });

      return dispose;
    });

    mockedBCInstance.postMessage("hi");
    expect(captured).toEqual([null, "hi"]);

    dispose();
  });

  test("posting messages with single instance channel name but called makeBroadcastChannel multiple times", () => {
    const channelName = "channel-1";
    const mockedBCInstance = buildMockBroadcastChannel(channelName);

    let message1 = "";
    let message2 = "";

    const dispose = createRoot(dispose => {
      const bc1 = createBroadcastChannel<MsgType>(channelName);
      const bc2 = createBroadcastChannel<MsgType>(channelName);

      createEffect(() => {
        message1 += bc1.message() + ";";
      });

      createEffect(() => {
        message2 += bc2.message() + ";";
      });

      return dispose;
    });

    mockedBCInstance.postMessage("hi");
    expect(message1).toBe("null;hi;");
    expect(message2).toBe("null;hi;");

    dispose();
  });
});
