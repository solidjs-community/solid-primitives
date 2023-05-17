import "./setup";
import { describe, expect, it, vi } from "vitest";
import { createRoot } from "solid-js";
import {
  createWS,
  createWSState,
  createReconnectingWS,
  makeReconnectingWS,
  makeHeartbeatWS,
  makeWS,
} from "../src";

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

describe("createWS", () => {
  it("closes the web socket on disposal", () =>
    new Promise<void>(resolve => {
      createRoot(dispose => {
        const ws = createWS("ws://localhost:5000");
        vi.spyOn(ws, "close").mockImplementation(() => resolve());
        dispose();
      });
    }));
});

describe("createWSState", () => {
  it("reacts to all changes of readyState", () =>
    new Promise<void>(resolve => {
      createRoot(dispose => {
        vi.useFakeTimers();
        const ws = createWS("ws://localhost:5000");
        const state = createWSState(ws);
        expect(state()).toEqual(ws.CONNECTING);
        vi.advanceTimersByTime(20);
        expect(state()).toEqual(ws.OPEN);
        vi.advanceTimersByTime(100);
        ws.close();
        expect(state()).toEqual(ws.CLOSING);
        vi.advanceTimersByTime(80);
        expect(state()).toEqual(ws.CLOSED);
        dispose();
        resolve();
      });
    }));
});

describe("makeReconnectingWS", () => {
  it("reconnects after being closed by external circumstances", () => {
    vi.useFakeTimers();
    const ws = makeReconnectingWS("ws://localhost:5000", undefined, { delay: 100 });
    expect(ws.readyState).toBe(0);
    vi.advanceTimersByTime(10);
    ws.dispatchEvent(new Event("close"));
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
  it("closes the web socket on disposal", () =>
    new Promise<void>(resolve => {
      createRoot(dispose => {
        const ws = createReconnectingWS("ws://localhost:5000", undefined, { delay: 100 });
        vi.spyOn(ws, "close").mockImplementation(() => resolve());
        dispose();
      });
    }));
});

describe("makeHeartbeatWS", () => {
  it("sends a heartbeat", () => {
    vi.useFakeTimers();
    const previousSockets = [...WSMessages.keys()];
    const ws = makeHeartbeatWS(
      makeReconnectingWS("ws://localhost:5000", undefined, { delay: 100 }),
    );
    const wsRef = [...WSMessages.keys()].find(socket => !previousSockets.includes(socket));
    vi.advanceTimersByTime(2500);
    expect(WSMessages.get(wsRef!)).toEqual(["ping"]);
    expect(ws.readyState).toBe(1);
  });
  it("reconnects after the pong is missing", () => {
    vi.useFakeTimers();
    const previousSockets = [...WSMessages.keys()];
    const ws = makeHeartbeatWS(
      makeReconnectingWS("ws://localhost:5000", undefined, { delay: 100 }),
    );
    const wsRef = [...WSMessages.keys()].find(socket => !previousSockets.includes(socket));
    wsRef && previousSockets.push(wsRef);
    vi.advanceTimersByTime(6000);
    const wsRef2 = [...WSMessages.keys()].find(socket => !previousSockets.includes(socket));
    expect(wsRef2).not.toBeUndefined();
    expect(ws.readyState).toBe(1);
  });
});
