import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { autofocus, createAutofocus } from "@solid-primitives/autofocus";
import readme from "../README.md?raw";
import { container } from "./_helpers.js";
import { Button } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "DOM/Autofocus",
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

export const AutofocusRefCallback = meta.story({
  name: "autofocus() ref callback",
  parameters: {
    docs: {
      description: {
        story:
          "`autofocus()` is a ref callback factory. Attach it via `ref={autofocus()}` and include the native `autofocus` attribute — the primitive checks for that attribute before focusing, so removing it is all you need to opt out. Unmount and remount the input below to see it re-focus each time.",
      },
    },
  },
  render: () => {
    const [mounted, setMounted] = createSignal(true);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>autofocus()</h3>

        <Show when={mounted()}>
          <input
            ref={autofocus()}
            autofocus
            placeholder="Autofocused on mount"
            style={{ padding: "0.4rem 0.75rem", "font-size": "1rem", width: "100%" }}
          />
        </Show>

        <Button onClick={() => setMounted(m => !m)} variant="secondary">
          {mounted() ? "Unmount" : "Remount (autofocus fires again)"}
        </Button>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          The native <code>autofocus</code> attribute alone only fires on page load. This
          primitive re-applies it on every render.
        </p>
      </div>
    );
  },
});

export const ConditionalAutofocus = meta.story({
  name: "Conditional autofocus",
  parameters: {
    docs: {
      description: {
        story:
          "Toggle the `autofocus` attribute to enable or disable focusing — no extra API needed. `autofocus()` only calls `.focus()` when the attribute is present on the element at settle time.",
      },
    },
  },
  render: () => {
    const [enabled, setEnabled] = createSignal(true);
    const [mounted, setMounted] = createSignal(true);

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>Conditional autofocus</h3>

        <label style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <input
            type="checkbox"
            checked={enabled()}
            onChange={e => setEnabled(e.currentTarget.checked)}
          />
          Enable autofocus
        </label>

        <Show when={mounted()}>
          <input
            ref={autofocus()}
            autofocus={enabled()}
            placeholder={enabled() ? "Will autofocus on mount" : "No autofocus"}
            style={{ padding: "0.4rem 0.75rem", "font-size": "1rem", width: "100%" }}
          />
        </Show>

        <Button onClick={() => setMounted(m => !m)} variant="secondary">
          {mounted() ? "Unmount" : "Remount"}
        </Button>
      </div>
    );
  },
});

export const CreateAutofocusLetRef = meta.story({
  name: "createAutofocus — let ref",
  parameters: {
    docs: {
      description: {
        story:
          "`createAutofocus(() => ref)` integrates with the reactive lifecycle using a plain `let` ref variable. The element receives focus after the component settles — no `autofocus` attribute required.",
      },
    },
  },
  render: () => {
    const [mounted, setMounted] = createSignal(true);

    const FocusedInput = () => {
      let ref!: HTMLInputElement;
      createAutofocus(() => ref);
      return (
        <input
          ref={ref}
          placeholder="Focused via let ref"
          style={{ padding: "0.4rem 0.75rem", "font-size": "1rem", width: "100%" }}
        />
      );
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createAutofocus — let ref</h3>

        <Show when={mounted()}>
          <FocusedInput />
        </Show>

        <Button onClick={() => setMounted(m => !m)} variant="secondary">
          {mounted() ? "Unmount" : "Remount (autofocus fires again)"}
        </Button>
      </div>
    );
  },
});

export const CreateAutofocusSignalRef = meta.story({
  name: "createAutofocus — signal ref",
  parameters: {
    docs: {
      description: {
        story:
          "`createAutofocus(ref)` also accepts a signal accessor — pass `ref={setRef}` on the element. Focus re-fires whenever the signal changes to a new element, making it easy to shift focus as the DOM updates.",
      },
    },
  },
  render: () => {
    const [mounted, setMounted] = createSignal(true);

    const FocusedInput = () => {
      const [ref, setRef] = createSignal<HTMLInputElement>();
      createAutofocus(ref);
      return (
        <input
          ref={setRef}
          placeholder="Focused via signal ref"
          style={{ padding: "0.4rem 0.75rem", "font-size": "1rem", width: "100%" }}
        />
      );
    };

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>createAutofocus — signal ref</h3>

        <Show when={mounted()}>
          <FocusedInput />
        </Show>

        <Button onClick={() => setMounted(m => !m)} variant="secondary">
          {mounted() ? "Unmount" : "Remount (autofocus fires again)"}
        </Button>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          The signal approach is useful when you need to store the ref elsewhere — e.g.{" "}
          <code>const [ref, setRef] = createSignal()</code> at an outer scope.
        </p>
      </div>
    );
  },
});
