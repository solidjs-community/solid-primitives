import { createMemo, createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createIsMounted, isHydrated, onElementConnect } from "@solid-primitives/lifecycle";
import readme from "../README.md?raw";
import {
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  EventLog,
  Section,
  StatRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Lifecycle",
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

export const RefReadGatedOnMount = meta.story({
  name: "Ref read gated on mount",
  parameters: {
    docs: {
      description: {
        story:
          "`createIsMounted` returns `false` on the initial synchronous render and flips to `true` after `onSettled`. Use it to guard any DOM read that needs a connected element — here `offsetWidth` — so the computation never runs before the ref is live. Click **Unmount → Remount** to watch the `false → true` transition.",
      },
    },
  },
  render: () => {
    const [show, setShow] = createSignal(true);

    const Demo = () => {
      let ref!: HTMLDivElement;
      const isMounted = createIsMounted();
      const width = createMemo(() => (isMounted() ? ref.offsetWidth : 0));

      return (
        <Card>
          <div
            ref={ref}
            style={{
              padding: "0.6rem 0.9rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              "font-size": "0.875rem",
              color: "#334155",
            }}
          >
            Measured element
          </div>
          <BoolRow label="isMounted()" value={isMounted()} />
          <StatRow label="offsetWidth" value={isMounted() ? `${width()}px` : "—"} />
        </Card>
      );
    };

    return (
      <Container width={280}>
        <ButtonRow>
          <Button onClick={() => setShow(v => !v)} variant="outline">
            {show() ? "Unmount" : "Remount"}
          </Button>
        </ButtonRow>
        <Show when={show()}>
          <Demo />
        </Show>
      </Container>
    );
  },
});

export const ClientOnlyGate = meta.story({
  name: "Client-only render gate",
  parameters: {
    docs: {
      description: {
        story:
          "`isHydrated()` returns `true` once the owner has cleared hydration — always `true` in a CSR context like Storybook. Putting it inside a `createMemo` implements a lightweight `ClientOnly` gate: the memo short-circuits to `false` on the server and during hydration, revealing its children only once on the client. The viewport values below are client-only and would be absent in an SSR render.",
      },
    },
  },
  render: () => {
    const clientContent = createMemo(
      () =>
        isHydrated() && (
          <>
            <StatRow label="window.innerWidth" value={`${window.innerWidth}px`} />
            <StatRow label="window.innerHeight" value={`${window.innerHeight}px`} />
          </>
        ),
    );

    return (
      <Container width={280}>
        <Card>
          <BoolRow label="isHydrated()" value={isHydrated()} />
          <Section title="Client-only content">{clientContent()}</Section>
        </Card>
      </Container>
    );
  },
});

export const ElementConnectLog = meta.story({
  name: "Element connect callback",
  parameters: {
    docs: {
      description: {
        story:
          "`onElementConnect` fires its callback the moment the target element becomes connected to the DOM. If `el.isConnected` is already `true` when the `ref` callback runs, it calls synchronously; otherwise it waits via a `ResizeObserver`. Toggle the element to see a timestamped log entry on each reconnection.",
      },
    },
  },
  render: () => {
    const [show, setShow] = createSignal(true);
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const addEntry = () => {
      const time = new Date().toLocaleTimeString();
      setLog(prev => [{ label: "connected", time }, ...prev].slice(0, 5));
    };

    return (
      <Container width={280}>
        <ButtonRow>
          <Button onClick={() => setShow(v => !v)} variant="outline">
            {show() ? "Unmount" : "Remount"}
          </Button>
        </ButtonRow>
        <Show when={show()}>
          <div
            ref={el => onElementConnect(el, addEntry)}
            style={{
              padding: "0.6rem 0.9rem",
              background: "#f0fdf4",
              border: "1px solid #86efac",
              "border-radius": "6px",
              "font-size": "0.875rem",
              color: "#166534",
            }}
          >
            Connected element
          </div>
        </Show>
        <EventLog entries={log()} />
      </Container>
    );
  },
});
