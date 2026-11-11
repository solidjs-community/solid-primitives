import preview from "../../../.storybook/preview.js";
import { createFaviconAnimation } from "@solid-primitives/favicon";
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

const FRAMES = ["#6366f1", "#8b5cf6", "#d946ef", "#f43f5e", "#f97316"].map(svgIcon);

export const Spinner = meta.story({
  name: "Loading spinner",
  parameters: {
    docs: {
      description: {
        story:
          'Cycles the favicon through a sequence of frames on an interval — for build-status spinners or "recording" pulses. Automatically pauses while the tab is hidden and resumes when it becomes visible again; switch away from this browser tab while playing to see it happen (`playing` below will flip back to `true` on return).',
      },
    },
  },
  render: () => {
    const spinner = createFaviconAnimation(FRAMES, { interval: 150 });

    return (
      <Container width={320}>
        <IconPreview href={FRAMES[spinner.frame()]!} label={`frame ${spinner.frame()}`} />

        <ButtonRow>
          <Button
            onClick={() => spinner.play()}
            variant={spinner.playing() ? "primary" : "outline"}
          >
            ▶ Play
          </Button>
          <Button
            onClick={() => spinner.pause()}
            variant={!spinner.playing() ? "primary" : "outline"}
          >
            ⏸ Pause
          </Button>
        </ButtonRow>

        <Section title="State">
          <BoolRow label="playing" value={spinner.playing()} />
          <StatRow label="frame" value={spinner.frame()} />
        </Section>
      </Container>
    );
  },
});
