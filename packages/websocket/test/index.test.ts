import "./setup";
import { describe, expect, it, vi } from "vitest";
import { createRoot } from "solid-js";
import { createWS, createReconnectingWS, createMessageWS, makeReconnectingWS, makeWS } from "../src";

describe("makeWS", () => {
  it("creates a web socket and opens it", () => {
    vi.useFakeTimers();
    const ws = makeWS("ws://localhost:5000");
    expect(ws).toBeInstanceOf(WebSocket);
    expect(ws.readyState).toBe(0);
    vi.advanceTimersToNextTimer();
    expect(ws.readyState).toBe(1);
    ws.close();
  });
  it("does not throw when attempting to send while not yet open", () => {
    vi.useFakeTimers();
    const ws = makeWS("ws://localhost:5000");
    expect(ws.readyState).toBe(0);
    expect(() => ws.send("it works")).not.toThrow();
    expect(WSMessages.get(ws)!).toHaveLength(0);
    vi.advanceTimersByTime(100);
    expect(WSMessages.get(ws)).toEqual(["it works"]);
    ws.close();
  });
});

describe("createMessageWS", () => {
  it("receives messages in the message accessor property", () => {
    vi.useFakeTimers();
    const ws = createMessageWS(makeWS("ws://localhost:5000"));
    vi.advanceTimersByTime(100);
    const ev = new MessageEvent('message', { data: "it works" });
    ws.dispatchEvent(ev);
    expect(ws.message()).toEqual("it works");
    ws.close();
  });
});

describe("createWS", () => {
  it("closes the web socket on disposal", () => new Promise<void>(resolve => {
    createRoot((dispose) => {
      const ws = createWS("ws://localhost:5000");      
      vi.spyOn(ws, 'close').mockImplementation(() => resolve());
      dispose();
    });
  }));
});

describe("makeReconnectingWS", () => {
  it("reconnects after being closed by external circumstances", () => {
    vi.useFakeTimers();
    const ws = makeReconnectingWS("ws://localhost:5000", undefined, { delay: 100 });
    expect(ws.readyState).toBe(0);
    vi.advanceTimersByTime(10);
    ws.dispatchEvent(new Event('close'));
    expect(ws.readyState).toBe(3);
    vi.advanceTimersByTime(500);
    expect(ws.readyState).toBe(1);
  });
  it("does not reconnect if manually closed", () => {
    vi.useFakeTimers();
      const ws = makeReconnectingWS("ws://localhost:5000", undefined, { delay: 100 });
      ws.close();
      vi.advanceTimersByTime(500);
      expect(ws.readyState).toBe(3);
  });
});

describe("createReconnectingWS", () => {
  it("closes the web socket on disposal", () => new Promise<void>(resolve => {
    createRoot((dispose) => {
      const ws = createReconnectingWS("ws://localhost:5000", undefined, { delay: 100 });
      vi.spyOn(ws, 'close').mockImplementation(() => resolve());
      dispose();
    });
  }));
});

