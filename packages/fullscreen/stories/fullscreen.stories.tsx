import { createSignal, onCleanup } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makeFullscreen, createFullscreen, fullscreen } from "../src/index.js";
import readme from "../README.md?raw";
import {
  Alert,
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  Section,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Fullscreen",
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

export const ImperativeControl = meta.story({
  name: "Imperative enter / exit",
  parameters: {
    docs: {
      description: {
        story:
          "`makeFullscreen` returns plain `enter` / `exit` functions with no Solid lifecycle dependency — bind it in a ref callback and call imperatively from any event handler.",
      },
    },
  },
  render: () => {
    const [isActive, setIsActive] = createSignal(false);
    let enter: (() => Promise<void>) | undefined;
    let exit: (() => Promise<void>) | undefined;

    return (
      <Container width={360}>
        <Alert variant="info">Fullscreen requires a user gesture. Press Esc or click Exit to leave.</Alert>
        <Card>
          <div
            ref={el => {
              [enter, exit] = makeFullscreen(el);
              const onChange = () => setIsActive(document.fullscreenElement === el);
              document.addEventListener("fullscreenchange", onChange);
              onCleanup(() => document.removeEventListener("fullscreenchange", onChange));
            }}
            style={{
              padding: "1.25rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              "text-align": "center",
              "font-size": "0.875rem",
              color: "#475569",
            }}
          >
            Fullscreen target element
          </div>
          <ButtonRow>
            <Button onClick={() => enter?.()}>Enter fullscreen</Button>
            <Button onClick={() => exit?.()} variant="outline">
              Exit
            </Button>
          </ButtonRow>
        </Card>
        <Section title="State">
          <BoolRow label="isActive" value={isActive()} />
        </Section>
      </Container>
    );
  },
});

export const ReactiveTracking = meta.story({
  name: "Reactive state tracking",
  parameters: {
    docs: {
      description: {
        story:
          "`createFullscreen` tracks real browser fullscreen state via `fullscreenchange`. `isActive` updates automatically — including when the user presses Esc.",
      },
    },
  },
  render: () => {
    const [ref, setRef] = createSignal<HTMLDivElement>();
    const { enter, exit, isActive } = createFullscreen(ref);

    return (
      <Container width={360}>
        <Alert variant="info">Press Esc or click Exit to leave fullscreen.</Alert>
        <Card>
          <div
            ref={setRef as (el: HTMLDivElement) => void}
            style={{
              padding: "1.25rem",
              background: "#f1f5f9",
              "border-radius": "6px",
              "text-align": "center",
              "font-size": "0.875rem",
              color: "#475569",
            }}
          >
            Fullscreen target element
          </div>
          <ButtonRow>
            <Button onClick={enter} disabled={isActive()}>
              Enter
            </Button>
            <Button onClick={exit} variant="outline" disabled={!isActive()}>
              Exit
            </Button>
          </ButtonRow>
        </Card>
        <Section title="State">
          <BoolRow label="isActive" value={isActive()} />
        </Section>
      </Container>
    );
  },
});

export const ClickToggle = meta.story({
  name: "Click-to-toggle",
  parameters: {
    docs: {
      description: {
        story:
          "The `fullscreen()` ref factory wires click-to-toggle onto any element. Clicking enters fullscreen; clicking again (or pressing Esc) exits. The listener is removed automatically on unmount.",
      },
    },
  },
  render: () => {
    const [isActive, setIsActive] = createSignal(false);
    const attach = fullscreen();

    return (
      <Container width={360}>
        <Alert variant="info">
          Click the card to enter fullscreen. Click again or press Esc to exit.
        </Alert>
        <div
          ref={el => {
            attach(el);
            const onChange = () => setIsActive(document.fullscreenElement === el);
            document.addEventListener("fullscreenchange", onChange);
            onCleanup(() => document.removeEventListener("fullscreenchange", onChange));
          }}
          style={{
            padding: "2rem 1rem",
            background: isActive() ? "#dbeafe" : "#f1f5f9",
            "border-radius": "8px",
            cursor: "pointer",
            "text-align": "center",
            border: `2px dashed ${isActive() ? "#3b82f6" : "#cbd5e1"}`,
            color: isActive() ? "#1e40af" : "#475569",
            "font-size": "0.875rem",
            transition: "background 200ms, border-color 200ms, color 200ms",
          }}
        >
          {isActive() ? "Fullscreen — click to exit" : "Click to enter fullscreen"}
        </div>
        <Section title="State">
          <BoolRow label="isActive" value={isActive()} />
        </Section>
      </Container>
    );
  },
});
