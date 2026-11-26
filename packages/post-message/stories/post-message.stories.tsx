import { createSignal, onCleanup } from "solid-js";
import { For } from "@solidjs/web";
import preview from "../../../.storybook/preview.js";
import { createPostMessage } from "../src/index.js";
import readme from "../README.md?raw";
import { Button, Container, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Network/PostMessage",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: { description: { component: readme } },
  },
});

export default meta;

const isText = (d: unknown): d is string => typeof d === "string";

export const MessagePortChannel = meta.story({
  name: "MessagePort channel",
  parameters: {
    docs: {
      description: {
        story:
          "Two ends of a `MessageChannel` talk through `createPostMessage` using a namespaced channel and a validator.",
      },
    },
  },
  render: () => {
    const { port1, port2 } = new MessageChannel();
    onCleanup(() => {
      port1.close();
      port2.close();
    });
    const a = createPostMessage<string, string>({
      target: port1,
      channel: "chat",
      validate: isText,
    });
    const b = createPostMessage<string, string>({
      target: port2,
      channel: "chat",
      validate: isText,
    });
    const [log, setLog] = createSignal<string[]>([]);
    b.onMessage(m => setLog(l => [...l, m]));
    let n = 0;
    return (
      <Container width={300}>
        <StatRow label="latest" value={b.message() ?? "—"} />
        <Button onClick={() => a.send(`message ${++n}`)}>Send</Button>
        <For each={log()}>{m => <div>{m}</div>}</For>
      </Container>
    );
  },
});
