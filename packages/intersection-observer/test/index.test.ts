import { render } from "solid-testing-library";
import createInterval from "../src/index";

describe("createInterval", (): void => {
  test("is passed a `handler` and a `delay`", () => {
    const handler = jest.fn();

    createInterval(handler, 1000);

    expect(handler).toHaveBeenCalledTimes(0);
    jest.advanceTimersByTime(5000);
    expect(handler).toHaveBeenCalledTimes(5);
  });

  test('if you pass a `delay` of `null`, the timer is "paused"', () => {
    const handler = jest.fn();

    createInterval(handler, null);

    jest.advanceTimersByTime(5000);
    expect(handler).toHaveBeenCalledTimes(0);
  });

  test("if you pass a new `handler`, the timer will not restart ", () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    let handler = handler1;

    createInterval(handler, 1000);

    jest.advanceTimersByTime(500);

    handler = handler2;

    jest.advanceTimersByTime(500);
    expect(handler1).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  test("if you pass a new `delay`, it will cancel the current timer and start a new one", () => {
    const handler = jest.fn();
    let delay = 500;

    createInterval(handler, delay);

    jest.advanceTimersByTime(1000);
    expect(handler).toHaveBeenCalledTimes(2);

    delay = 1000;
    jest.advanceTimersByTime(5000);
    expect(handler).toHaveBeenCalledTimes(7);
  });

  test('if you pass a new `delay` of `null`, it will cancel the current timer and "pause"', () => {
    const handler = jest.fn();
    let delay: number | null = 500;

    createInterval(handler, delay);

    jest.advanceTimersByTime(1000);
    expect(handler).toHaveBeenCalledTimes(2);

    delay = null;
    jest.advanceTimersByTime(5000);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  test("passing the same parameters causes no change in the timer", () => {
    const handler = jest.fn();

    createInterval(handler, 1000);

    jest.advanceTimersByTime(500);

    jest.advanceTimersByTime(500);
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
