import preview from "../../../.storybook/preview.js";
import { createDate, createTimeDifference, createTimeDifferenceFromNow } from "@solid-primitives/date";
import { formatMs, toDatetimeLocal } from "./_helpers.js";
import { Stat, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Date",
  parameters: { layout: "centered" },
});

export default meta;

export const TimeDifference = meta.story({
  name: "Date difference",
  parameters: {
    docs: {
      description: {
        story:
          "`createTimeDifference` returns the difference in milliseconds between two reactive dates. Both inputs can be signals — the result updates whenever either changes.",
      },
    },
  },
  render: () => {
    const [from, setFrom] = createDate(new Date(Date.now() - 7 * 86_400_000));
    const [to, setTo] = createDate(new Date());
    const [diff] = createTimeDifference(from, to);

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createTimeDifference</h3>

        <div style={{ display: "flex", gap: "1rem", "flex-wrap": "wrap" }}>
          <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.85rem" }}>
            From
            <input
              type="datetime-local"
              value={toDatetimeLocal(from())}
              onInput={e => setFrom(new Date(e.currentTarget.value))}
            />
          </label>
          <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.85rem" }}>
            To
            <input
              type="datetime-local"
              value={toDatetimeLocal(to())}
              onInput={e => setTo(new Date(e.currentTarget.value))}
            />
          </label>
        </div>

        <div>
          <Stat label="Difference (ms)">{diff()}</Stat>
          <Stat label="Formatted">{formatMs(diff())}</Stat>
          <Stat label="Days">{(diff() / 86_400_000).toFixed(2)}</Stat>
        </div>
      </Container>
    );
  },
});

export const TimeDifferenceFromNow = meta.story({
  name: "Live difference from now",
  parameters: {
    docs: {
      description: {
        story:
          "`createTimeDifferenceFromNow` auto-updates the \"now\" side of the difference on a configurable interval, so the result stays current without manual wiring.",
      },
    },
  },
  render: () => {
    const [target, setTarget] = createDate(new Date(Date.now() + 3_600_000));
    const [diff, { now, target: targetDate, update }] = createTimeDifferenceFromNow(target, 1000);

    return (
      <Container minWidth={340}>
        <h3 style={{ margin: 0 }}>createTimeDifferenceFromNow</h3>

        <label style={{ display: "flex", "flex-direction": "column", gap: "0.25rem", "font-size": "0.85rem" }}>
          Target date
          <input
            type="datetime-local"
            value={toDatetimeLocal(target())}
            onInput={e => setTarget(new Date(e.currentTarget.value))}
          />
        </label>

        <div>
          <Stat label="Now">{now().toLocaleTimeString()}</Stat>
          <Stat label="Target">{targetDate().toLocaleString()}</Stat>
          <Stat label="Difference">{formatMs(diff())}</Stat>
        </div>

        <Button onClick={update} variant="outline" style={{ "align-self": "flex-start" }}>
          Force update
        </Button>
      </Container>
    );
  },
});
