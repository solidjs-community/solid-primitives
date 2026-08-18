import { createEffect, createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createSearchParams } from "@solid-primitives/url";
import { Button, ButtonRow, Container, Section, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/URL",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const GranularReactivity = meta.story({
  name: "Granular reactivity",
  parameters: {
    docs: {
      description: {
        story:
          "`ReactiveSearchParams` behaves like `URLSearchParams`, but every read is granular — an effect reading `get('foo')` only reruns when `foo` actually changes, not when an unrelated key is written. The counters below track how many times each effect has rerun.",
      },
    },
  },
  render: () => {
    const params = createSearchParams("foo=1&bar=2");
    const [fooRuns, setFooRuns] = createSignal(0);
    const [barRuns, setBarRuns] = createSignal(0);

    createEffect(
      () => params.get("foo"),
      () => {
        setFooRuns(n => n + 1);
      },
      { defer: true },
    );
    createEffect(
      () => params.get("bar"),
      () => {
        setBarRuns(n => n + 1);
      },
      { defer: true },
    );

    return (
      <Container width={360}>
        <Section title="params">
          <StatRow label="toString()" value={params.toString()} />
        </Section>

        <Section title="foo">
          <StatRow label="get('foo')" value={params.get("foo") ?? "—"} />
          <StatRow label="effect reruns" value={fooRuns()} />
          <ButtonRow>
            <Button onClick={() => params.set("foo", String(Date.now() % 1000))} variant="outline">
              bump foo
            </Button>
          </ButtonRow>
        </Section>

        <Section title="bar (unaffected by foo updates)">
          <StatRow label="get('bar')" value={params.get("bar") ?? "—"} />
          <StatRow label="effect reruns" value={barRuns()} />
          <ButtonRow>
            <Button onClick={() => params.set("bar", String(Date.now() % 1000))} variant="outline">
              bump bar
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});
