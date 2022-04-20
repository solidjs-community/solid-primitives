<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=ui%20-%20switch" alt="Solid Primitives UI - Switch">
</p>

# Switch

Switches allow users to turn an individual option on or off. They are usually used to activate or deactivate a specific setting. A switch is similar to a checkbox, but represents on/off values as opposed to selection.

## `createSwitch`

Provides the behavior and accessibility implementation for a switch component.

### How to use it

```tsx
import {
  AriaSwitchProps,
  createFocusRing,
  createSwitch,
  createToggleState,
  createVisuallyHidden
} from "@solid-primitives/ui";

interface SwitchProps extends AriaSwitchProps {
  // your component specific props
}

function Switch(props: SwitchProps) {
  let ref: HTMLInputElement | undefined;

  const state = createToggleState(props);
  const { inputProps } = createSwitch(props, state, ref);
  const { isFocusVisible, focusRingProps } = createFocusRing();
  const { visuallyHiddenProps } = createVisuallyHidden();

  return (
    <label class="my-switch__wrapper">
      <div {...visuallyHiddenProps()}>
        <input {...inputProps()} {...focusRingProps()} ref={ref} class="my-switch__input" />
      </div>
      <span
        classList={{
          "my-switch": true,
          "my-switch--selected": state.isSelected(),
          "my-switch--focused": isFocusVisible()
        }}
      />
      <span class="my-switch__label">{props.children}</span>
    </label>
  );
}

function App() {
  return <Switch>Low power mode</Switch>;
}
```
