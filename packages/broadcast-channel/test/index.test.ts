import { describe, test, expect } from "vitest";
import { createEffect, createRoot, on } from "solid-js";
import { createBroadcastChannel, makeBroadcastChannel } from "../src";

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
  test("makeBroadcastChannel() return values", () =>
    createRoot(dispose => {
      const _channelName = "channel-1";
      const { onMessage, postMessage, channelName, close, instance } =
        makeBroadcastChannel(_channelName);

      expect(channelName).toBe(_channelName);
      expect(onMessage).toBeInstanceOf(Function);
      expect(postMessage).toBeInstanceOf(Function);
      expect(close).toBeInstanceOf(Function);
      expect(instance).toBeInstanceOf(BroadcastChannel);

      // expect(5).toBe(10 || 5)
      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() checking instances from BroadcastChannel constructor", () =>
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
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages between pages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage } = makeBroadcastChannel(channelName);

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
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages with single instance channel name but called makeBroadcastChannel multiple times", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage: onMessage1 } = makeBroadcastChannel(channelName);
      const { onMessage: onMessage2 } = makeBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage1(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage2(({ data }) => {
            postedMessage += `${data}2`;
          });

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("hi1hi2");

      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage: onMessage1 } = makeBroadcastChannel(channelName);
      const { onMessage: onMessage2 } = makeBroadcastChannel("channel-2");

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage1(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage2(({ data }) => {
            postedMessage += `${data}2`;
          });

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("hi1");

      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() sending messages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";

      const { onMessage: onMessage1, postMessage: postedMessage1 } =
        makeBroadcastChannel(channelName);
      const { onMessage: onMessage2, postMessage: postedMessage2 } =
        makeBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage1(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage2(({ data }) => {
            postedMessage += `${data}2`;
          });

          postedMessage1("hi");
          postedMessage2("bye");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("");

      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage } = makeBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage(({ data }) => {
            postedMessage += `${data}2`;
          });
          onMessage(({ data }) => {
            postedMessage += `${data}3`;
          });

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("hi1hi2hi3");

      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage, close } = makeBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage(({ data }) => {
            postedMessage += `${data}2`;
          });
          onMessage(({ data }) => {
            postedMessage += `${data}3`;
          });

          close();

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("");

      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage: onMessage1 } = makeBroadcastChannel(channelName);
      const { onMessage: onMessage2, close: close2 } = makeBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage1(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage2(({ data }) => {
            postedMessage += `${data}2`;
          });

          close2();

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("hi1");

      dispose();
    }));
});

describe("makeBroadcastChannel", () => {
  test("makeBroadcastChannel() posting messages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { onMessage: onMessage1 } = makeBroadcastChannel(channelName);
      const { onMessage: onMessage2, instance: instance2 } = makeBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          onMessage1(({ data }) => {
            postedMessage += `${data}1`;
          });
          onMessage2(({ data }) => {
            postedMessage += `${data}2`;
          });

          instance2.close();

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("");

      dispose();
    }));
});

describe("createBroadcastChannel", () => {
  test("createBroadcastChannel() return values", () =>
    createRoot(dispose => {
      const _channelName = "channel-1";
      const { postMessage, channelName, close, instance } = createBroadcastChannel(_channelName);

      expect(channelName).toBe(_channelName);
      expect(postMessage).toBeInstanceOf(Function);
      expect(close).toBeInstanceOf(Function);
      expect(instance).toBeInstanceOf(BroadcastChannel);

      dispose();
    }));
});

describe("createBroadcastChannel", () => {
  test("createBroadcastChannel() checking instances from BroadcastChannel constructor", () =>
    createRoot(dispose => {
      const channelName = "channel-1";
      const { instance: instance1 } = createBroadcastChannel(channelName);
      const { instance: instance2 } = createBroadcastChannel(channelName);
      const { instance: instance3 } = createBroadcastChannel("channel-5");

      expect(instance1).toBeInstanceOf(BroadcastChannel);
      expect(instance2).toBeInstanceOf(BroadcastChannel);
      expect(instance3).toBeInstanceOf(BroadcastChannel);

      expect(instance1).toBe(instance2);
      expect(instance1).not.toBe(instance3);

      dispose();
    }));
});

describe("createBroadcastChannel", () => {
  test("createBroadcastChannel() posting messages between pages", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { message } = createBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          createEffect(
            on(
              message,
              message => {
                resolve(message);
              },
              { defer: true }
            )
          );

          mockedBCInstance.postMessage("hi");
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toBe("hi");

      dispose();
    }));
});

describe("createBroadcastChannel", () => {
  test("createBroadcastChannel() posting messages with single instance channel name but called makeBroadcastChannel multiple times", () =>
    createRoot(async dispose => {
      const channelName = "channel-1";
      const mockedBCInstance = buildMockBroadcastChannel(channelName);

      const { message: message1 } = createBroadcastChannel(channelName);
      const { message: message2 } = createBroadcastChannel(channelName);

      const getPostMessage = () =>
        new Promise<string>(resolve => {
          let postedMessage = "";

          createEffect(
            on(
              message1,
              message => {
                postedMessage += `${message}1`;
              },
              { defer: true }
            )
          );

          createEffect(
            on(
              message2,
              message => {
                postedMessage += `${message}2`;
              },
              { defer: true }
            )
          );

          mockedBCInstance.postMessage("hi");

          setTimeout(() => {
            resolve(postedMessage);
          }, 200);
        });

      const postedMessage = await getPostMessage();

      expect(postedMessage).toMatch(/^(hi1hi2)|(hi2hi1)$/);

      dispose();
    }));
});
