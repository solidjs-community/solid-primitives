import { createSignal } from "solid-js";
import { Show } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import { createDismissableLayer, useLayerStack } from "../src/index.js";
import readme from "../README.md?raw";
import { Button, Container, EventLog, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "UI Patterns/Dismissable",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: readme } },
  },
});

export default meta;

export const NestedLayers = meta.story({
  name: "Nested layers",
  parameters: {
    docs: {
      description: {
        story:
          "Escape and outside presses dismiss only the topmost layer. The inner layer can be made non-dismissible; the attempt is reported instead of closing it.",
      },
    },
  },
  render: () => {
    const [outer, setOuter] = createSignal(false);
    const [inner, setInner] = createSignal(false);
    const [locked, setLocked] = createSignal(false);
    const [log, setLog] = createSignal<string[]>([]);
    const stack = useLayerStack();
    const push = (m: string) => setLog(l => [m, ...l].slice(0, 8));

    const Layer = (p: {
      name: string;
      close: () => void;
      dismissible?: () => boolean;
      children?: any;
    }) => {
      const [el, setEl] = createSignal<HTMLElement>();
      createDismissableLayer({
        ref: el,
        onDismiss: reason => {
          push(`${p.name}: dismissed (${reason})`);
          p.close();
        },
        ...(p.dismissible && { dismissible: p.dismissible }),
        onDismissAttempt: reason => push(`${p.name}: blocked (${reason})`),
      });
      return (
        <div
          ref={setEl}
          style={{ border: "1px solid #888", padding: "0.75rem", margin: "0.5rem 0" }}
        >
          <strong>{p.name}</strong>
          {p.children}
        </div>
      );
    };

    return (
      <Container width={340}>
        <StatRow label="layers" value={stack().length} />
        <Button onClick={() => setOuter(true)}>Open outer</Button>
        <Show when={outer()}>
          <Layer name="outer" close={() => setOuter(false)}>
            <div>
              <Button onClick={() => setInner(true)}>Open inner</Button>
              <label>
                <input
                  type="checkbox"
                  checked={locked()}
                  onChange={e => setLocked(e.currentTarget.checked)}
                />{" "}
                inner not dismissible
              </label>
              <Show when={inner()}>
                <Layer name="inner" close={() => setInner(false)} dismissible={() => !locked()} />
              </Show>
            </div>
          </Layer>
        </Show>
        <EventLog entries={log().map(label => ({ label, time: "" }))} />
      </Container>
    );
  },
});
