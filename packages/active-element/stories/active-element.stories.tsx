import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createActiveElement,
  makeActiveElementListener,
  focus,
} from "@solid-primitives/active-element";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  colors,
  Container,
  EventLog,
  font,
  inputStyle,
} from "../../../.storybook/ui/index.js";

// prevent tree-shaking of focus directive namespace extension
focus;

const meta = preview.meta({
  title: "Inputs/Active Element",
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

export const ReactiveActiveElement = meta.story({
  name: "Reactive active element",
  parameters: {
    docs: {
      description: {
        story:
          "`createActiveElement()` returns a reactive accessor that tracks `document.activeElement` globally. It updates whenever focus moves anywhere in the document — click or tab between the inputs below to see it update.",
      },
    },
  },
  render: () => {
    const activeEl = createActiveElement();

    const label = () => {
      const el = activeEl();
      if (!el) return "none";
      return (el as HTMLInputElement).placeholder || el.tagName.toLowerCase();
    };

    return (
      <Container width={300}>
        <div
          style={{
            display: "flex",
            "justify-content": "space-between",
            "align-items": "center",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Active element</span>
          <Badge variant={activeEl() ? "success" : "default"}>{label()}</Badge>
        </div>
        <input placeholder="First name" style={inputStyle} />
        <input placeholder="Last name" style={inputStyle} />
        <input placeholder="Email" style={inputStyle} />
        <BoolRow label="activeEl() !== null" value={activeEl() !== null} />
      </Container>
    );
  },
});

export const ActiveElementListener = meta.story({
  name: "Imperative listener",
  parameters: {
    docs: {
      description: {
        story:
          "`makeActiveElementListener(callback)` attaches `focus` and `blur` capture listeners to the window and calls the callback with the newly active element (or `null` when focus leaves entirely). Returns a cleanup function to remove the listeners.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const addLog = (el: Element | null) => {
      const name = el
        ? (el as HTMLInputElement).placeholder || el.tagName.toLowerCase()
        : "(none)";
      setLog(prev =>
        [{ label: `→ ${name}`, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5),
      );
    };

    makeActiveElementListener(addLog);

    return (
      <Container width={300}>
        <input placeholder="First input" style={inputStyle} />
        <input placeholder="Second input" style={inputStyle} />
        <input placeholder="Third input" style={inputStyle} />
        <EventLog entries={log()} />
      </Container>
    );
  },
});

export const FocusDirective = meta.story({
  name: "Focus directive",
  parameters: {
    docs: {
      description: {
        story:
          "The `focus` directive fires its callback with `true` when the element gains focus and `false` when it blurs. Attach it with `use:focus={setter}` on any focusable element — each element tracks its own active state independently.",
      },
    },
  },
  render: () => {
    const fields = ["Name", "Email", "Message"];

    const FocusedInput = (props: { label: string }) => {
      const [isFocused, setIsFocused] = createSignal(false);
      return (
        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <input
            use:focus={setIsFocused}
            placeholder={props.label}
            style={{ ...inputStyle, flex: "1" }}
          />
          <Badge variant={isFocused() ? "success" : "default"}>
            {isFocused() ? "active" : "—"}
          </Badge>
        </div>
      );
    };

    return (
      <Container width={320}>
        <For each={fields}>{label => <FocusedInput label={label} />}</For>
      </Container>
    );
  },
});
