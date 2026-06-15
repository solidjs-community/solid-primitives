import { createSignal, onSettled, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  autofocus,
  createAutofocus,
  createFocusSignal,
  makeFocusListener,
  createFocusTrap,
} from "@solid-primitives/focus";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Card,
  colors,
  Container,
  EventLog,
  font,
  inputStyle,
  Kbd,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Inputs/Focus",
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

export const FocusOnRender = meta.story({
  name: "Focus on render",
  parameters: {
    docs: {
      description: {
        story:
          "`autofocus()` is a ref callback factory that re-applies focus on every mount — the native `autofocus` attribute alone only fires on page load. Attach it via `ref={autofocus()}` alongside the `autofocus` HTML attribute. To opt out, remove the attribute — the primitive checks for it before focusing.",
      },
    },
  },
  render: () => {
    const [mounted, setMounted] = createSignal(true);

    return (
      <Container width={300}>
        <Show when={mounted()}>
          <input
            ref={autofocus()}
            autofocus
            placeholder="Focused on every mount"
            style={inputStyle}
          />
        </Show>
        <Button onClick={() => setMounted(m => !m)} variant="secondary">
          {mounted() ? "Unmount" : "Remount (re-focuses)"}
        </Button>
        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.mutedFg }}>
          Unmount and remount to see <code>autofocus()</code> fire again — the browser won't do
          this on its own.
        </p>
      </Container>
    );
  },
});

export const SignalDrivenFocus = meta.story({
  name: "Signal-driven focus",
  parameters: {
    docs: {
      description: {
        story:
          "`createAutofocus(ref)` accepts a signal accessor — pass `ref={setRef}` on the element and hold the reference reactively. Focus re-fires whenever the accessor changes to a new element, making it easy to shift focus as the DOM updates.",
      },
    },
  },
  render: () => {
    const [mounted, setMounted] = createSignal(true);

    const FocusedField = () => {
      const [ref, setRef] = createSignal<HTMLInputElement>();
      createAutofocus(ref);
      return (
        <input ref={setRef} placeholder="Focused via signal ref" style={inputStyle} />
      );
    };

    return (
      <Container width={300}>
        <Show when={mounted()}>
          <FocusedField />
        </Show>
        <Button onClick={() => setMounted(m => !m)} variant="secondary">
          {mounted() ? "Unmount" : "Remount"}
        </Button>
        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.mutedFg }}>
          The signal ref pattern is useful when the element reference needs to be passed up or
          shared — focus fires each time the signal resolves to a new element.
        </p>
      </Container>
    );
  },
});

export const LiveFocusState = meta.story({
  name: "Live focus state",
  parameters: {
    docs: {
      description: {
        story:
          "`createFocusSignal(target)` returns a boolean signal that updates whenever the target element gains or loses focus. Accepts either a direct element reference or a reactive accessor.",
      },
    },
  },
  render: () => {
    const FocusTracker = () => {
      let inputRef!: HTMLInputElement;
      const isFocused = createFocusSignal(() => inputRef);

      return (
        <Container width={260}>
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "align-items": "center",
            }}
          >
            <span style={{ "font-size": font.sizeBase, color: colors.muted }}>Focus state</span>
            <Badge variant={isFocused() ? "success" : "default"}>
              {isFocused() ? "focused" : "blurred"}
            </Badge>
          </div>
          <input ref={inputRef} placeholder="Click to focus" style={inputStyle} />
          <BoolRow label="isFocused()" value={isFocused()} />
        </Container>
      );
    };

    return <FocusTracker />;
  },
});

export const FocusEventLog = meta.story({
  name: "Imperative focus events",
  parameters: {
    docs: {
      description: {
        story:
          "`makeFocusListener(target, callback, useCapture?)` imperatively attaches `focus` and `blur` listeners to an element and returns a cleanup function. Useful in scenarios where you need to set up listeners outside a reactive scope or alongside other non-reactive setup.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const addLog = (msg: string) =>
      setLog(prev =>
        [{ label: msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 5),
      );

    let el1!: HTMLInputElement;
    let el2!: HTMLInputElement;

    onSettled(() => {
      const c1 = makeFocusListener(el1, focused =>
        addLog(`Input A — ${focused ? "focused" : "blurred"}`),
      );
      const c2 = makeFocusListener(el2, focused =>
        addLog(`Input B — ${focused ? "focused" : "blurred"}`),
      );
      return () => {
        c1();
        c2();
      };
    });

    return (
      <Container width={300}>
        <input ref={el1} placeholder="Input A — click to focus" style={inputStyle} />
        <input ref={el2} placeholder="Input B — click to focus" style={inputStyle} />
        <EventLog entries={log()} />
      </Container>
    );
  },
});

export const TabWrapsInDialog = meta.story({
  name: "Tab wraps in dialog",
  parameters: {
    docs: {
      description: {
        story:
          "`createFocusTrap({ element, enabled })` traps keyboard focus inside a container. Tab cycles forward through focusable children; Shift+Tab cycles backward. When the trap deactivates, focus is restored to the element that was focused before the trap activated.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = createSignal(false);
    const [trapRef, setTrapRef] = createSignal<HTMLElement>();

    createFocusTrap({ element: trapRef, enabled: open });

    return (
      <Container width={300}>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Show when={open()}>
          <div
            ref={setTrapRef}
            style={{
              background: "white",
              border: `1px solid ${colors.border}`,
              "border-radius": radii.lg,
              padding: "1rem",
              display: "flex",
              "flex-direction": "column",
              gap: "0.5rem",
              "box-shadow": "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ margin: 0, "font-size": font.sizeBase, "font-weight": "600" }}>
              Dialog
            </p>
            <input placeholder="Name" style={inputStyle} />
            <input placeholder="Email" style={inputStyle} />
            <ButtonRow>
              <Button onClick={() => setOpen(false)} variant="outline" style={{ flex: "1" }}>
                Cancel
              </Button>
              <Button style={{ flex: "1" }}>Submit</Button>
            </ButtonRow>
          </div>
        </Show>
        <p style={{ margin: 0, "font-size": font.sizeSm, color: colors.mutedFg }}>
          Press <Kbd>Tab</Kbd> / <Kbd>Shift+Tab</Kbd> — focus wraps inside the dialog. Closing
          restores focus to the trigger button.
        </p>
      </Container>
    );
  },
});

export const CustomInitialFocus = meta.story({
  name: "Custom initial focus",
  parameters: {
    docs: {
      description: {
        story:
          "Use `initialFocusElement` to override which element receives focus when the trap activates. Here the Cancel button receives initial focus instead of the first focusable element (the Name input). Also demonstrates `onInitialFocus` / `onFinalFocus` callbacks for observing focus moves.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = createSignal(false);
    const [trapRef, setTrapRef] = createSignal<HTMLElement>();
    const [cancelRef, setCancelRef] = createSignal<HTMLElement>();
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    const addLog = (msg: string) =>
      setLog(prev =>
        [{ label: msg, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 4),
      );

    createFocusTrap({
      element: trapRef,
      enabled: open,
      initialFocusElement: cancelRef,
      onInitialFocus: () => addLog("onInitialFocus"),
      onFinalFocus: () => addLog("onFinalFocus"),
    });

    return (
      <Container width={300}>
        <Button onClick={() => setOpen(true)}>Open dialog</Button>
        <Show when={open()}>
          <div
            ref={setTrapRef}
            style={{
              background: "white",
              border: `1px solid ${colors.border}`,
              "border-radius": radii.lg,
              padding: "1rem",
              display: "flex",
              "flex-direction": "column",
              gap: "0.5rem",
              "box-shadow": "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <p style={{ margin: 0, "font-size": font.sizeBase, "font-weight": "600" }}>
              Dialog — Cancel focused first
            </p>
            <input placeholder="Name" style={inputStyle} />
            <input placeholder="Email" style={inputStyle} />
            <ButtonRow>
              <Button
                ref={setCancelRef}
                onClick={() => setOpen(false)}
                variant="outline"
                style={{ flex: "1" }}
              >
                Cancel
              </Button>
              <Button style={{ flex: "1" }}>Submit</Button>
            </ButtonRow>
          </div>
        </Show>
        <EventLog entries={log()} />
      </Container>
    );
  },
});
