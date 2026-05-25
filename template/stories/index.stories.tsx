import preview from "../../../.storybook/preview.js";

// Replace with your actual primitive imports, e.g.:
// import { createPrimitiveTemplate } from "@solid-primitives/template-primitive";

const meta = preview.meta({
  title: "Category/PackageName",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: "Short description of what this primitive does.",
      },
    },
  },
});

export default meta;

export const Default = meta.story({
  name: "Default",
  render: () => {
    // Demonstrate the primitive here.
    // This function runs inside a Solid reactive owner — use createSignal,
    // createEffect, etc. freely.
    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem" }}>
        <p>Replace this with your primitive demo.</p>
      </div>
    );
  },
});
