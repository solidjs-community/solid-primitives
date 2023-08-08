import { describe, test, expect } from "vitest";
import { createBroadcastChannel, makeBroadcastChannel } from "../src/index.js";

describe("API doesn't break in SSR", () => {
  test("makeBroadcastChannel() - SSR", () => {
    const _channelName = "channel-1";
    const { onMessage, postMessage, channelName, close, instance } =
      makeBroadcastChannel(_channelName);

    expect(channelName).toBe(_channelName);
    expect(onMessage).toBeInstanceOf(Function);
    expect(postMessage).toBeInstanceOf(Function);
    expect(close).toBeInstanceOf(Function);
    expect(instance).toBeInstanceOf(Object);
  });
});

describe("API doesn't break in SSR", () => {
  test("createBroadcastChannel() - SSR", () => {
    const _channelName = "channel-1";
    const { message, postMessage, channelName, close, instance } =
      createBroadcastChannel(_channelName);

    expect(channelName).toBe(_channelName);
    expect(message).toBeInstanceOf(Function);
    expect(postMessage).toBeInstanceOf(Function);
    expect(close).toBeInstanceOf(Function);
    expect(instance).toBeInstanceOf(Object);
  });
});
