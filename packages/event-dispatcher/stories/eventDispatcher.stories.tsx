import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createEventDispatcher } from "@solid-primitives/event-dispatcher";
import readme from "../README.md?raw";
import {
  Badge,
  Button,
  ButtonRow,
  Container,
  EventLog,
  BoolRow,
  Section,
  StatRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Event Dispatcher",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

export const PayloadDispatch = meta.story({
  name: "Payload dispatch",
  parameters: {
    docs: {
      description: {
        story:
          "A child component dispatches typed `CustomEvent`s to its parent via `on${Name}` props. TypeScript enforces the payload type at every call site — wrong types become compile errors.",
      },
    },
  },
  render: () => {
    const [total, setTotal] = createSignal(0);

    const Stepper = (p: { onAdjust: (e: CustomEvent<number>) => void }) => {
      const dispatch = createEventDispatcher(p);
      return (
        <ButtonRow>
          <Button onClick={() => dispatch("adjust", 1)}>+1</Button>
          <Button onClick={() => dispatch("adjust", 10)}>+10</Button>
          <Button variant="secondary" onClick={() => dispatch("adjust", -1)}>
            −1
          </Button>
        </ButtonRow>
      );
    };

    return (
      <Container width={300}>
        <Stepper onAdjust={e => setTotal(t => t + e.detail)} />
        <StatRow label="total" value={total()} />
        <Button variant="ghost" onClick={() => setTotal(0)}>
          Reset
        </Button>
      </Container>
    );
  },
});

export const CancelableEvent = meta.story({
  name: "Cancelable event",
  parameters: {
    docs: {
      description: {
        story:
          "Passing `{ cancelable: true }` lets the parent call `evt.preventDefault()` to block the action. `dispatch` mirrors the DOM `dispatchEvent` contract: returns `false` when cancelled, `true` otherwise.",
      },
    },
  },
  render: () => {
    const [intercept, setIntercept] = createSignal(true);
    const [result, setResult] = createSignal<boolean | null>(null);

    const SaveButton = (p: { onSave: (e: CustomEvent<string>) => void }) => {
      const dispatch = createEventDispatcher(p);
      return (
        <Button onClick={() => setResult(dispatch("save", "report.pdf", { cancelable: true }))}>
          Save file
        </Button>
      );
    };

    return (
      <Container width={300}>
        <BoolRow label="parent intercepts" value={intercept()} />
        <ButtonRow>
          <Button
            variant="secondary"
            onClick={() => {
              setIntercept(v => !v);
              setResult(null);
            }}
          >
            Toggle intercept
          </Button>
        </ButtonRow>
        <SaveButton
          onSave={e => {
            if (intercept()) e.preventDefault();
          }}
        />
        <Show when={result() !== null}>
          <Section title="Result">
            <BoolRow label="dispatch returned" value={result()!} />
            <Badge variant={result()! ? "success" : "error"}>
              {result()! ? "File saved" : "Blocked by parent"}
            </Badge>
          </Section>
        </Show>
      </Container>
    );
  },
});

export const OptionalHandler = meta.story({
  name: "Optional handler",
  parameters: {
    docs: {
      description: {
        story:
          "When an `on${Event}` prop is not provided, `dispatch` returns `true` without throwing — no manual `if (props.onEvent)` guard needed in the child.",
      },
    },
  },
  render: () => {
    const [handlerCalls, setHandlerCalls] = createSignal(0);
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const addEntry = (text: string) =>
      setLog(p => [{ label: text, time: new Date().toLocaleTimeString() }, ...p].slice(0, 6));

    const Panel = (p: {
      onNotify: (e: CustomEvent<string>) => void;
      onDismiss?: (e: CustomEvent<string>) => void;
    }) => {
      const dispatch = createEventDispatcher(p);
      return (
        <ButtonRow>
          <Button onClick={() => addEntry(`notify → ${dispatch("notify", "msg")}`)}>
            Notify (handler)
          </Button>
          <Button
            variant="secondary"
            onClick={() => addEntry(`dismiss → ${dispatch("dismiss", "msg")}`)}
          >
            Dismiss (no handler)
          </Button>
        </ButtonRow>
      );
    };

    return (
      <Container width={360}>
        <Panel onNotify={() => setHandlerCalls(c => c + 1)} />
        <StatRow label="handler calls" value={handlerCalls()} />
        <EventLog entries={log()} />
      </Container>
    );
  },
});
