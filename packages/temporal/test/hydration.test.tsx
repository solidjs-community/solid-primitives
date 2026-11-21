import "temporal-polyfill/global";
import { describe, it, expect, afterEach } from "vitest";
import {
  renderHydrationRoundTrip,
  type HydrationRoundTripResult,
} from "../../../scripts/test-utils/hydration-harness.ts";

// `createTemporal(fn)`, `createZonedDateTimeNow`, `createToday`, `createDuration` and
// `createRelativeTime` all create render-body memos / compute-form signals. Values are chosen
// so the server and client render the same text even though they run at different times.
const APP_SOURCE = `
import "temporal-polyfill/global";
import {
  createTemporal,
  createZonedDateTimeNow,
  createToday,
  createDuration,
  createRelativeTime,
} from "@solid-primitives/temporal";

export default function App() {
  const [date] = createTemporal(() => Temporal.PlainDate.from("2026-01-31"));
  const [now] = createZonedDateTimeNow("UTC", 0);
  const today = createToday("UTC");
  const duration = createDuration(date, () => Temporal.PlainDate.from("2026-03-31"), {
    largestUnit: "months",
  });
  const [text] = createRelativeTime(Temporal.Instant.from("2000-01-01T00:00:00Z"), {
    locale: "en",
    timeZone: "UTC",
    interval: 0,
  });
  return (
    <div id="out">
      <span id="date">{date().toString()}</span>
      <span id="zone">{now().timeZoneId}</span>
      <span id="year">{today().year > 2000 ? "ok" : "bad"}</span>
      <span id="duration">{duration().toString()}</span>
      <span id="text">{text().endsWith("years ago") ? "ok" : text()}</span>
    </div>
  );
}
`;

describe("temporal hydration round trip", () => {
  let result: HydrationRoundTripResult | undefined;

  afterEach(() => {
    result?.cleanup();
    result = undefined;
  });

  it("server-renders the values", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.html).toContain("2026-01-31");
    expect(result.html).toContain("P2M");
  });

  it("hydrates without any console error or warning", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    expect(result.consoleMessages).toEqual([]);
  });

  it("hydrates into the same values", async () => {
    result = await renderHydrationRoundTrip(APP_SOURCE, import.meta.dirname);
    const text = (id: string) => result!.container.querySelector(`#${id}`)?.textContent;
    expect(text("date")).toBe("2026-01-31");
    expect(text("zone")).toBe("UTC");
    expect(text("year")).toBe("ok");
    expect(text("duration")).toBe("P2M");
    expect(text("text")).toBe("ok");
  });
});
