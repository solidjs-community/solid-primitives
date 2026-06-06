import { create } from "storybook/theming/create";

export const solidTheme = create({
  base: "dark",

  brandTitle: "Solid Primitives",
  brandImage: "/img/logo.png",
  brandTarget: "_self",

  // Solid.js brand blues (sourced from logo gradient stops)
  colorPrimary: "#518ac8",
  colorSecondary: "#76b3e1",

  // App chrome
  appBg: "#0d1b2a",
  appContentBg: "#122033",
  appPreviewBg: "#122033",
  appBorderColor: "#1f3b77",
  appBorderRadius: 6,

  // Text
  textColor: "#dcf2fd",
  textInverseColor: "#0d1b2a",
  textMutedColor: "#76b3e1",

  // Toolbar / sidebar
  barTextColor: "#76b3e1",
  barHoverColor: "#dcf2fd",
  barSelectedColor: "#76b3e1",
  barBg: "#0d1b2a",

  // Inputs
  inputBg: "#1a2e45",
  inputBorder: "#315aa9",
  inputTextColor: "#dcf2fd",
  inputBorderRadius: 4,

  fontBase: '"Geist", "Inter", system-ui, sans-serif',
  fontCode: '"Geist Mono", "Fira Code", monospace',
});
