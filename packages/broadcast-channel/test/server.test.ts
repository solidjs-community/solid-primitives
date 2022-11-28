import { describe, test, expect } from "vitest";
import { makeBroadcastChannel } from "../src";

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
