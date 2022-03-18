import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot } from "solid-js";
import createMediaQuery, { createBreakpoints } from "../src/index";

suite("createMediaQuery", (): void => {});

const testResponsive = suite("createBreakpoints");

const breakpoints = {
  sm: "640px",
  lg: "1024px",
  xl: "1280px"
} as const;

let originalWindow = global.window;

testResponsive.before.each(() => {
  global.window = {
    matchMedia(query) {
      return {
        matches: false,
        query,
        addEventListener() {},
        removeEventListener() {}
      };
    }
  };
});

testResponsive.after.each(() => {
  global.window = originalWindow;
});

testResponsive("give the smallest breakpoint by default", () => {
  createRoot(dispose => {
    const { matches, minMatch } = createBreakpoints(breakpoints);
    assert.equal(matches(), {
      sm: false,
      lg: false,
      xl: false
    });
    assert.equal(minMatch('sm'), false);
    dispose();
  });
});

testResponsive.run();
