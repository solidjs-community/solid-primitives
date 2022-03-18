import { describe, test, expect, vi, beforeEach, beforeAll, afterEach, afterAll } from "vitest";
import { createEffect, createRoot, onMount } from "solid-js";
import createMediaQuery, { createBreakpoints } from "../src/index";

describe("createMediaQuery", () => {
  const breakpoints = {
    sm: "640px",
    lg: "1024px",
    xl: "1280px"
  } as const;

  const matchMediaMock = vi.fn();
  const addListenerMock = vi.fn();
  const removeListenerMock = vi.fn();
  let originalMatchMedia, matchingBreakpoints;

  function checkMatch(query: string) {
    const isMatch = matchingBreakpoints.some(breakpoint => query.includes(breakpoint));
    return isMatch;
  }

  beforeAll(() => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = matchMediaMock;
  });

  beforeEach(() => {
    matchingBreakpoints = [];
    matchMediaMock.mockImplementation((query: string) => {
      return {
        matches: checkMatch(query),
        query,
        addEventListener: addListenerMock,
        removeEventListener: removeListenerMock
      };
    });
  });

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("give the smallest breakpoint by default", () => {
    createRoot(dispose => {
      const { matches, minMatch } = createBreakpoints(breakpoints);
      expect(matches()).toEqual({
        sm: false,
        lg: false,
        xl: false
      });
      expect(minMatch("sm")).toEqual(false);
      expect(minMatch("unknown")).toEqual(false);
      dispose();
    });
  });

  test("give sm breakpoint when min-width: 640px media query matches", () => {
    createRoot(dispose => {
      matchingBreakpoints = [breakpoints.sm];
      const { matches, minMatch } = createBreakpoints(breakpoints);
      expect(matches()).toEqual({
        sm: true,
        lg: false,
        xl: false
      });
      expect(minMatch("sm")).toEqual(true);
      expect(minMatch("lg")).toEqual(false);
      dispose();
    });
  });

  test("give lg breakpoint when min-width: 1024px media query matches", () => {
    createRoot(dispose => {
      matchingBreakpoints = [breakpoints.sm, breakpoints.lg];
      const { matches, minMatch } = createBreakpoints(breakpoints);
      expect(matches()).toEqual({
        sm: true,
        lg: true,
        xl: false
      });
      expect(minMatch("sm")).toEqual(true);
      expect(minMatch("lg")).toEqual(true);
      expect(minMatch("xl")).toEqual(false);
      dispose();
    });
  });

  test("update breakpoint when media query change event is triggered", async () => {
    const actualOutput = await new Promise(resolve => {
      createRoot(dispose => {
        const { matches, minMatch } = createBreakpoints(breakpoints);
        const output = [];

        createEffect(() => {
          output.push({
            matches: matches(),
            minMatch: {
              sm: minMatch("sm"),
              lg: minMatch("lg")
            }
          });

          if (output.length >= 2) {
            dispose();
            resolve(output);
          }
        });

        onMount(() => {
          const smListener = addListenerMock.mock.calls[0][1];
          const lgListener = addListenerMock.mock.calls[1][1];
          smListener({
            matches: true
          });
          lgListener({
            matches: true
          });
        });
      });
    });

    expect(actualOutput).toMatchInlineSnapshot(`
      [
        {
          "matches": {
            "lg": false,
            "sm": false,
            "xl": false,
          },
          "minMatch": {
            "lg": false,
            "sm": false,
          },
        },
        {
          "matches": {
            "lg": true,
            "sm": true,
            "xl": false,
          },
          "minMatch": {
            "lg": true,
            "sm": true,
          },
        },
      ]
    `);
    expect(removeListenerMock).toBeCalledTimes(3);
  });

  test("do not setup listeners if watchChange is false", () => {
    createRoot(dispose => {
      createBreakpoints(breakpoints, false);

      onMount(() => {
        expect(addListenerMock).toBeCalledTimes(0);
        dispose();
      });
    });
    expect(removeListenerMock).toBeCalledTimes(0);
  });
});
