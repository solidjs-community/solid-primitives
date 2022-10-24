import { describe, expect, it } from "vitest";

import createAnalytics, { EventType } from "../src/index";

describe("createPrimitiveTemplate", () => {
  it("track function calls all handlers with the event", () => {
    const called: any[][] = [];
    const handlers = [...new Array(5)].map(
      (_, i) =>
        (...args) =>
          (called[i] = args)
    );
    const track = createAnalytics(handlers);
    const eventData = {};
    track(EventType.Event, eventData);
    expect(called).toEqual(new Array(5).fill([EventType.Event, eventData]));
  });
});
