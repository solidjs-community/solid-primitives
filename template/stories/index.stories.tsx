/**
 * STORIES SETUP FOR A NEW PRIMITIVE PACKAGE
 * ==========================================
 *
 * File structure
 * --------------
 * packages/[name]/
 *   stories/
 *     tsconfig.json          ← extends .storybook/tsconfig.json, required for TS/ESLint
 *     _helpers.tsx           ← optional: shared UI helpers (prefixed _ so SB ignores it)
 *     [primitive].stories.tsx ← one file per primitive, or split further as needed
 *
 * Multiple primitives in one package
 * -----------------------------------
 * Give every stories file the same `title` so Storybook groups them together.
 * Only ONE file should carry `tags: ["autodocs"]` and the README description —
 * that file becomes the package's Docs landing page.
 *
 * Static assets (audio, images, etc.)
 * ------------------------------------
 * Place files in stories/assets/ and register them in .storybook/main.ts:
 *   staticDirs: [{ from: "../packages/[name]/stories/assets", to: "/[name]" }]
 */

import preview from "../../.storybook/preview.js";
import readme from "../README.md?raw";

// Replace with your actual primitive imports:
// import { createMyPrimitive } from "@solid-primitives/my-package";

/**
 * `preview.meta(...)` defines shared settings for every story in this file.
 *
 * title    — "Category/PackageName" — maps to the sidebar path.
 *            Use the `primitive.category` value from package.json.
 *            Examples: "Display & Media/Audio", "Network/WebSocket"
 *
 * autodocs — generates a Docs page that renders the README as component
 *            description plus inline previews of every story in the file.
 *
 * layout   — "centered" (default) | "fullscreen" | "padded"
 */
const meta = preview.meta({
  title: "Category/PackageName",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

/**
 * `meta.story(...)` defines an individual story.
 *
 * name   — displayed in the sidebar and Docs page.
 *          Convention: "primitiveName — what it demonstrates"
 *          e.g. "createAudio — reactive player"
 *
 * render — a function that returns JSX. It runs inside a Solid reactive owner,
 *          so createSignal, createEffect, onCleanup, etc. all work as expected.
 *          Storybook disposes the owner when the story unmounts.
 *
 * parameters.docs.description.story — markdown shown above this story on the
 *          Docs page. Explain what aspect of the primitive is being demonstrated.
 */
export const Default = meta.story({
  name: "Default",
  parameters: {
    docs: {
      description: {
        story: "Replace this description with a short explanation of what this story shows.",
      },
    },
  },
  render: () => {
    // Demonstrate the primitive here.
    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem" }}>
        <p>Replace this with your primitive demo.</p>
      </div>
    );
  },
});
