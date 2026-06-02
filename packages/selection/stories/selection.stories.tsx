import preview from "../../../.storybook/preview.js";
import { createSelection, getTextNodes } from "@solid-primitives/selection";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  StatRow,
  inputStyle,
  Label,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Forms/Selection",
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

const fmtPos = (n: number) => (isNaN(n) ? "–" : String(n));

const getSelectedText = (node: HTMLElement | null, start: number, end: number) => {
  if (!node || isNaN(start) || isNaN(end) || start === end) return "";
  const content =
    node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement
      ? node.value
      : node.textContent ?? "";
  return content.slice(start, end);
};

export const LiveTracking = meta.story({
  name: "Live cursor tracking",
  parameters: {
    docs: {
      description: {
        story:
          "`createSelection` returns a reactive `[node, start, end]` tuple that updates on every pointer, keyboard, and focus event. Click or drag to select in either field and watch the offsets update in real time.",
      },
    },
  },
  render: () => {
    const [sel] = createSelection();

    return (
      <Container>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <Label>Input</Label>
          <input type="text" value="The quick brown fox" style={inputStyle} />
        </div>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <Label>Textarea</Label>
          <textarea
            value="jumps over the lazy dog"
            style={{ ...inputStyle, resize: "none", height: "52px" }}
          />
        </div>

        <Section title="Selection state">
          <StatRow
            label="element"
            value={sel()[0] ? (sel()[0] as HTMLElement).tagName.toLowerCase() : "none"}
          />
          <StatRow label="start" value={fmtPos(sel()[1])} />
          <StatRow label="end" value={fmtPos(sel()[2])} />
          <StatRow
            label="selected"
            value={getSelectedText(sel()[0], sel()[1], sel()[2]) || "—"}
          />
        </Section>
      </Container>
    );
  },
});

export const ProgrammaticSet = meta.story({
  name: "Programmatic cursor set",
  parameters: {
    docs: {
      description: {
        story:
          "The setter accepts the same `[node, start, end]` tuple. Click a button to jump the cursor or extend the selection programmatically — the input is focused and positioned automatically.",
      },
    },
  },
  render: () => {
    let inputRef!: HTMLInputElement;
    const text = "Hello, World!";
    const [sel, setSel] = createSelection();

    return (
      <Container>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <Label>Input</Label>
          <input ref={el => (inputRef = el)} type="text" value={text} style={inputStyle} />
        </div>

        <ButtonRow>
          <Button variant="outline" onClick={() => setSel([inputRef, 0, 0])}>
            Start
          </Button>
          <Button
            variant="outline"
            onClick={() => setSel([inputRef, text.length, text.length])}
          >
            End
          </Button>
          <Button variant="outline" onClick={() => setSel([inputRef, 0, text.length])}>
            All
          </Button>
          <Button variant="outline" onClick={() => setSel([inputRef, 7, 12])}>
            "World"
          </Button>
        </ButtonRow>

        <Section title="Current selection">
          <StatRow label="start" value={fmtPos(sel()[1])} />
          <StatRow label="end" value={fmtPos(sel()[2])} />
        </Section>
      </Container>
    );
  },
});

export const RichText = meta.story({
  name: "Rich text (contentEditable)",
  parameters: {
    docs: {
      description: {
        story:
          "In a `contentEditable` element with nested `<strong>` and `<em>` elements, `getTextNodes` unifies all descendant text nodes so offsets are contiguous. Position 4 is the start of **quick** regardless of DOM nesting.",
      },
    },
  },
  render: () => {
    let divRef!: HTMLDivElement;
    const [sel] = createSelection();

    const isActive = () => sel()[0]?.contentEditable === "true";
    const nodeCount = () => (divRef ? getTextNodes(divRef).length : 0);

    return (
      <Container>
        <Label>contentEditable — click and drag to select</Label>
        <div
          ref={el => (divRef = el)}
          contentEditable
          innerHTML="The <strong>quick brown</strong> fox jumps over the <em>lazy</em> dog."
          style={{
            ...inputStyle,
            "min-height": "56px",
            "line-height": "1.7",
            outline: "none",
          }}
          spellcheck={false}
        />

        <Section title="Selection state">
          <StatRow label="active" value={isActive() ? "yes" : "no"} />
          <StatRow label="text nodes" value={String(nodeCount())} />
          <StatRow label="start" value={fmtPos(sel()[1])} />
          <StatRow label="end" value={fmtPos(sel()[2])} />
        </Section>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          <code>getTextNodes()</code> finds {nodeCount()} text nodes inside this element.
          Offsets are unified across all of them, so the selection API treats the whole content
          as one flat string.
        </p>
      </Container>
    );
  },
});
