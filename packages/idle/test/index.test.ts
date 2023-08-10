import { describe, test, expect, beforeEach, vi, afterAll } from "vitest";
import { createRoot } from "solid-js";
import { createIdleTimer } from "../src/index.js";

vi.useFakeTimers();

beforeEach(() => {
  vi.clearAllTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

describe("createIdleTimer", () => {
  test("signals when the user is prompted and idle according to the configuration timeouts", () => {
    const timer = createRoot(dispose => {
      const timer = createIdleTimer({
        idleTimeout: 5,
        promptTimeout: 5,
      });

      return { ...timer, dispose };
    });

    vi.advanceTimersByTime(2);

    expect(timer.isPrompted(), "user is not prompted yet").toBe(false);
    expect(timer.isIdle(), "user is not idle yet").toBe(false);

    vi.advanceTimersByTime(5);
    expect(timer.isPrompted(), "user has been prompted").toBe(true);
    expect(timer.isIdle(), "user is not idle yet").toBe(false);

    vi.advanceTimersByTime(5);
    expect(timer.isPrompted(), "user is not in the prompted phase anymore").toBe(false);
    expect(timer.isIdle(), "user is idle").toBe(true);

    timer.stop();
    timer.dispose();
  });

  test("start and stop should successfully bind, unbind the event listeners, reset should clean and restart the timers", () => {
    const timer = createRoot(dispose => {
      const timer = createIdleTimer({
        idleTimeout: 5,
        startManually: true,
      });

      return { ...timer, dispose };
    });

    expect(timer.isIdle(), "user is not idle yet, events are not bound yet").toBe(false);

    timer.start();

    vi.advanceTimersByTime(50);
    expect(timer.isIdle(), "user is idle, timer should have expired by now").toBe(true);

    timer.reset();

    vi.advanceTimersByTime(4);
    expect(timer.isIdle(), "user is not idle yet, timers have restarted").toBe(false);
    vi.advanceTimersByTime(50);
    expect(timer.isIdle(), "user is idle again").toBe(true);

    timer.stop();
    vi.advanceTimersByTime(1);
    expect(timer.isIdle(), "user is not idle anymore, timers have been cleaned up").toBe(false);

    vi.advanceTimersByTime(50);
    expect(
      timer.isIdle(),
      "user is still not idle, event listeners are unbound, timers have not restarted",
    ).toBe(false);

    timer.dispose();
  });

  test("configuration options shall work", () => {
    let currStatus: "initial" | "idle" | "active" | "prompted" = "initial";
    const div = document.createElement("div");

    const timer = createRoot(dispose => {
      const timer = createIdleTimer({
        promptTimeout: 30,
        idleTimeout: 30,
        startManually: true,
        onActive: () => (currStatus = "active"),
        onIdle: () => (currStatus = "idle"),
        onPrompt: () => (currStatus = "prompted"),
        element: div,
        events: ["click"],
      });

      return { ...timer, dispose };
    });

    vi.advanceTimersByTime(10);
    expect(currStatus, "events are not bound yet, the status has not changed").toBe("initial");

    timer.start();

    vi.advanceTimersByTime(50);
    expect(
      currStatus,
      "timers have started, user should be in the prompt phase, onPrompt should have been called by now",
    ).toBe("prompted");
    vi.advanceTimersByTime(60);
    expect(currStatus, "prompt timer has expired, onIdle should have been called by now").toBe(
      "idle",
    );

    div.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(currStatus, "idle status should persist if the fired event is not in the list").toBe(
      "idle",
    );

    div.click();
    expect(
      currStatus,
      "click is on the event list, it should trigger onActive when dispatched on the observed element",
    ).toBe("active");

    timer.stop();

    timer.dispose();
  });
});
