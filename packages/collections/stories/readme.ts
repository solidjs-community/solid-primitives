import raw from "../README.md?raw";

// Storybook does not publish the repository's Markdown files as routes.
export const readme = raw.replace(
  /\]\((\.\.?\/[^)]+)\)/g,
  (_, path: string) =>
    `](${new URL(path, "https://github.com/solidjs-community/solid-primitives/blob/main/packages/collections/README.md").href})`,
);
