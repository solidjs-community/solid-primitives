import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createFaviconScheme } from "@solid-primitives/favicon";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  BoolRow,
  StatRow,
} from "../../../.storybook/ui/index.js";
import { svgIcon, IconPreview } from "./_helpers.js";

const meta = preview.meta({
  title: "Browser APIs/Favicon",
});

export default meta;

const ICON_SETS = [
  { light: svgIcon("#6366f1"), dark: svgIcon("#a5f3fc") },
  { light: svgIcon("#16a34a"), dark: svgIcon("#f59e0b") },
];

export const ColorScheme = meta.story({
  name: "Light/dark mode",
  parameters: {
    docs: {
      description: {
        story:
          "Follows `prefers-color-scheme` automatically — toggle your OS or browser dark mode to see it react live. The button below swaps which light/dark icon *pair* is in use (the other axis `createFaviconScheme` reacts to), independent of the OS setting.",
      },
    },
  },
  render: () => {
    const [setIndex, setSetIndex] = createSignal(0);
    const favicon = createFaviconScheme(() => ICON_SETS[setIndex()]!);

    return (
      <Container width={320}>
        <IconPreview href={favicon.href()} label={`scheme: ${favicon.scheme()}`} />

        <ButtonRow>
          <Button onClick={() => setSetIndex(i => (i + 1) % ICON_SETS.length)} variant="secondary">
            Swap icon pair
          </Button>
        </ButtonRow>

        <Section title="State">
          <StatRow label="scheme" value={favicon.scheme()} />
          <BoolRow label="dark" value={favicon.scheme() === "dark"} />
        </Section>
      </Container>
    );
  },
});
