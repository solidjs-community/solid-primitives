import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createFavicon } from "@solid-primitives/favicon";
import readme from "../README.md?raw";
import { Button, ButtonRow, Container, Section, BoolRow } from "../../../.storybook/ui/index.js";
import { svgIcon, IconPreview } from "./_helpers.js";

const meta = preview.meta({
  title: "Browser APIs/Favicon",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: readme,
      },
    },
  },
});

export default meta;

const ICONS = {
  default: svgIcon("#6366f1"),
  alert: svgIcon("#e11d48"),
};

export const BasicSwap = meta.story({
  name: "Reactive swap",
  parameters: {
    docs: {
      description: {
        story:
          "`createFavicon` reactively swaps the document favicon (visible in the real browser tab — try switching away and back). This story also mirrors the current href in a preview box since the actual tab icon isn't visible inside the canvas.",
      },
    },
  },
  render: () => {
    const [alert, setAlert] = createSignal(false);
    const href = createFavicon(() => (alert() ? ICONS.alert : ICONS.default));

    return (
      <Container width={320}>
        <IconPreview href={href()} />

        <ButtonRow>
          <Button onClick={() => setAlert(false)} variant={!alert() ? "primary" : "outline"}>
            Default
          </Button>
          <Button onClick={() => setAlert(true)} variant={alert() ? "primary" : "outline"}>
            Alert
          </Button>
        </ButtonRow>

        <Section title="State">
          <BoolRow label="alert" value={alert()} />
        </Section>
      </Container>
    );
  },
});
