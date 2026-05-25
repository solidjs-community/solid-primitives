import { definePreview } from "storybook-solidjs-vite/next";

export default definePreview({
  parameters: {
    layout: "centered",
    docs: {
      toc: true,
    },
  },
});
