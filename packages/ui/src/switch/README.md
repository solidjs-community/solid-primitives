<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=ui%20-%20switch" alt="Solid Primitives UI - Switch">
</p>

# Switch

Switches allow users to turn an individual option on or off. They are usually used to activate or deactivate a specific setting. A switch is similar to a checkbox, but represents on/off values as opposed to selection.

## `createSwitch`

Provides the behavior and accessibility implementation for a switch component.

### Features

There is no native HTML element with switch styling. `<input type="checkbox">` is the closest semantically, but isn't styled or exposed to assistive technology as a switch. `createSwitch` helps achieve accessible switches that can be styled as needed.

- Built with a native HTML `<input>` element, which can be optionally visually hidden to allow custom styling
- Full support for browser features like form autofill
- Keyboard focus management and cross browser normalization
- Labeling support for screen readers
- Exposed as a switch to assistive technology via ARIA

### How to use it

This example uses SVG to build the switch, with a visually hidden native input to represent the switch for accessibility. This is possible using the [`createVisuallyHidden`](../visually-hidden/) primitive. It is still in the DOM and accessible to assistive technology, but invisible. The SVG element is the visual representation, and is hidden from screen readers with aria-hidden.

For keyboard accessibility, a focus ring is important to indicate which element has keyboard focus. This is implemented with the `createFocusRing` primitive. When `isFocusVisible` is true, an extra SVG element is rendered to indicate focus. The focus ring is only visible when the user is interacting with a keyboard, not with a mouse or touch.

```tsx
import {
  AriaSwitchProps,
  createFocusRing,
  createSwitch,
  createToggleState,
  createVisuallyHidden
} from "@solid-primitives/ui";

function Switch(props: AriaSwitchProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createSwitch(props, state, () => ref);
  const { isFocusVisible, focusRingProps } = createFocusRing();
  const { visuallyHiddenProps } = createVisuallyHidden<HTMLDivElement>();

  return (
    <label style={{ display: "flex", "align-items": "center" }}>
      <div {...visuallyHiddenProps()}>
        <input {...inputProps()} {...focusRingProps()} ref={ref} />
      </div>
      <svg width={40} height={24} aria-hidden="true" style={{ "margin-right": "4px" }}>
        <rect
          x={4}
          y={4}
          width={32}
          height={16}
          rx={8}
          fill={state.isSelected() ? "orange" : "gray"}
        />
        <circle cx={state.isSelected() ? 28 : 12} cy={12} r={5} fill="white" />
        {isFocusVisible() && (
          <rect
            x={1}
            y={1}
            width={38}
            height={22}
            rx={11}
            fill="none"
            stroke="orange"
            stroke-width={2}
          />
        )}
      </svg>
      {props.children}
    </label>
  );
}

function App() {
  return <Switch>Low power mode</Switch>;
}
```

### Internationalization

#### RTL

In right-to-left languages, switches should be mirrored. Ensure that your CSS accounts for this.
