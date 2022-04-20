<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=ui%20-%20checkbox" alt="Solid Primitives UI - Checkbox">
</p>

# Checkbox

Checkboxes allow users to select multiple items from a list of individual items, or to mark one individual item as selected.

## `createCheckbox`

Provides the behavior and accessibility implementation for a checkbox component.

### Features

Checkboxes can be built with the `<input />` HTML element, but this can be difficult to style. `createCheckbox` helps achieve accessible checkboxes that can be styled as needed.

- Built with a native HTML `<input />` element, which can be optionally visually hidden to allow custom styling
- Full support for browser features like form autofill
- Keyboard focus management and cross browser normalization
- Labeling support for assistive technology
- Indeterminate state support

### How to use it

```tsx
import { AriaCheckboxProps, createCheckbox, createToggleState } from "@solid-primitives/ui";

interface CheckboxProps extends AriaCheckboxProps {
  // your component specific props
}

function Checkbox(props: CheckboxProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createCheckbox(props, state, () => ref);

  return (
    <label>
      <input {...inputProps()} ref={ref} />
      <span>{props.children}</span>
    </label>
  );
}

function App() {
  return (
    <div>
      <Checkbox>Checkbox</Checkbox>
      <Checkbox isIndeterminate>Checkbox</Checkbox>
    </div>
  );
}
```

### Styling

To build a custom styled checkbox, you can make the native input element visually hidden. This is possible using the [`createVisuallyHidden`](../visually-hidden/) primitive. It is still in the DOM and accessible to assistive technology, but invisible. This example uses SVG to build the visual checkbox, which is hidden from screen readers with aria-hidden.

For keyboard accessibility, a focus ring is important to indicate which element has keyboard focus. This is implemented with the `createFocusRing` primitive. When `isFocusVisible` is true, an extra SVG element is rendered to indicate focus. The focus ring is only visible when the user is interacting with a keyboard, not with a mouse or touch.

```tsx
import {
  AriaCheckboxProps,
  createCheckbox,
  createFocusRing,
  createToggleState,
  createVisuallyHidden
} from "@solid-primitives/ui";

import { Show } from "solid-js/web";

interface CheckboxProps extends AriaCheckboxProps {
  // your component specific props
}

function Checkbox(props: CheckboxProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createCheckbox(props, state, () => ref);
  const { isFocusVisible, focusRingProps } = createFocusRing();
  const { visuallyHiddenProps } = createVisuallyHidden<HTMLDivElement>();

  return (
    <label style={{ display: "flex", "align-items": "center" }}>
      <div {...visuallyHiddenProps()}>
        <input {...inputProps()} {...focusRingProps()} ref={ref} />
      </div>
      <svg width={24} height={24} aria-hidden="true" style={{ "margin-right": "4px" }}>
        <rect
          x={state.isSelected() ? 4 : 5}
          y={state.isSelected() ? 4 : 5}
          width={state.isSelected() ? 16 : 14}
          height={state.isSelected() ? 16 : 14}
          fill={state.isSelected() ? "orange" : "none"}
          stroke={state.isSelected() ? "none" : "gray"}
          stroke-width={2}
        />
        <Show when={state.isSelected()}>
          <path
            transform="translate(7 7)"
            d={`M3.788 9A.999.999 0 0 1 3 8.615l-2.288-3a1 1 0 1 1
            1.576-1.23l1.5 1.991 3.924-4.991a1 1 0 1 1 1.576 1.23l-4.712
            6A.999.999 0 0 1 3.788 9z`}
          />
        </Show>
        <Show when={isFocusVisible()}>
          <rect x={1} y={1} width={22} height={22} fill="none" stroke="orange" stroke-width={2} />
        </Show>
      </svg>
      {props.children}
    </label>
  );
}

function App() {
  return <Checkbox>Checkbox</Checkbox>;
}
```

### Internationalization

#### RTL

In right-to-left languages, the checkbox should be mirrored. The checkbox should be placed on the right side of the label. Ensure that your CSS accounts for this.

## `createCheckboxGroup`

TODO
