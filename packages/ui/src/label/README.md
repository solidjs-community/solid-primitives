<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=Primitives&background=tiles&project=ui%20-%20label" alt="Solid Primitives UI - Label">
</p>

# Label

Labels provide context for user inputs.

## `createLabel`

Provides the accessibility implementation for labels and their associated elements. It associates a label with a field and automatically handles creating an id for the field and associates the label with it.

### How to use it

```tsx
import { LabelAriaProps, createLabel } from "@solid-primitives/ui";

interface ColorFieldProps extends LabelAriaProps {
  // your component specific props
}

function ColorField(props: ColorFieldProps) {
  const { labelProps, fieldProps } = createLabel(props);

  return (
    <>
      <label {...labelProps()}>{props.label}</label>
      <select {...fieldProps()}>
        <option>Indigo</option>
        <option>Maroon</option>
        <option>Chartreuse</option>
      </select>
    </>
  );
}

function App() {
  return <ColorField label="Favorite color" />;
}
```

By default, `createLabel` assumes that the label is a native HTML label element. However, if you are labeling a non-native form element, be sure to use an element other than a `<label>` and set the `labelElementType` prop appropriately.
