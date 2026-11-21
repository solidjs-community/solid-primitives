import "temporal-polyfill/global";
import { describe, test, expect, vi, afterEach } from "vitest";
import { createRoot } from "solid-js";
import {
  createTemporal,
  createInstantNow,
  createZonedDateTimeNow,
  createToday,
  createDuration,
  createRelativeTime,
} from "../src/index.ts";

afterEach(() => {
  vi.useRealTimers();
});

describe("temporal — SSR", () => {
  test("renders static values without scheduling timers", () =>
    createRoot(dispose => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-03-07T12:00:00Z"));

      const [date] = createTemporal(Temporal.PlainDate.from("2026-01-31"));
      expect(date().toString()).toBe("2026-01-31");

      const [instant, update] = createInstantNow(1000);
      expect(instant().toString()).toBe("2026-03-07T12:00:00Z");
      expect(() => update()).not.toThrow();

      const [zoned] = createZonedDateTimeNow("Asia/Tokyo", 1000);
      expect(zoned().hour).toBe(21);

      const today = createToday("Asia/Tokyo");
      expect(today().toString()).toBe("2026-03-07");

      const duration = createDuration(zoned, zoned().add({ hours: 5 }));
      expect(duration().toString()).toBe("PT5H");

      const [text] = createRelativeTime(Temporal.Instant.from("2026-03-07T09:00:00Z"), {
        locale: "en",
        timeZone: "UTC",
      });
      expect(text()).toBe("3 hours ago");

      expect(vi.getTimerCount()).toBe(0);
      dispose();
    }));
});
