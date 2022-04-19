<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=ui%20-%20visually%20hidden" alt="Solid Primitives UI - Visually Hidden">
</p>

# Visually Hidden

Visually hidden is a common technique for hidding an element visually, while keeping it visible to screen readers and other assistive technology. This would typically be used when you want to take advantage of the behavior and semantics of a native element like a checkbox or radio button, but replace it with a custom styled element visually.

## `createVisuallyHidden`

Provides props for an element that hides its children visually, but keeps content visible to assistive technology.

### Usage

```jsx
import { createVisuallyHidden } from "@solid-primitives/ui";

export function Checkbox(props) {
  const [local, others] = splitProps(props, ["children"]);

  const { visuallyHiddenProps } = createVisuallyHidden();

  return (
    <label class="checkbox__wrapper" {...others}>
      <div {...visuallyHiddenProps}>
        <input class="checkbox__input" type="checkbox" />
      </div>
      <span class="checkbox__box" />
      <span class="checkbox__label">{local.children}</span>
    </label>
  );
}
```

### Props

|               | Description                                                                 | Type                                  | Default value |
| :------------ | :-------------------------------------------------------------------------- | :------------------------------------ | :-----------: |
| `isFocusable` | Whether the element should become visible on focus, for example skip links. | `MaybeAccessor<boolean \| undefined>` |    `false`    |
| `style`       | Additional style to be passed to the element.                               | `MaybeAccessor<boolean \| undefined>` |               |
