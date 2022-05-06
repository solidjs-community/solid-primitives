import { suite } from "uvu";
import * as assert from "uvu/assert";

import createAnalytics, { EventType } from "../src/index";

const tca = suite("createPrimitiveTemplate");

tca("track function calls all handlers with the event", () => {
  const called = [];
  const handlers = [...new Array(5)].map(
    (_, i) =>
      (...args) =>
        (called[i] = args)
  );
  const track = createAnalytics(handlers);
  track(EventType.Event, null);
  assert.equal(called, new Array(5).fill([EventType.Event, null]));
});

tca.run();

const lga = suite("loadGoogleAnalytics");
