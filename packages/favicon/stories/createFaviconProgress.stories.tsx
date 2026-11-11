import { createEffect, createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createFaviconProgress } from "@solid-primitives/favicon";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  StatRow,
  colors,
  font,
} from "../../../.storybook/ui/index.js";
import { svgIcon, IconPreview } from "./_helpers.js";

const meta = preview.meta({
  title: "Browser APIs/Favicon",
});

export default meta;

const BASE_ICON = svgIcon("#6366f1");

export const Progress = meta.story({
  name: "Upload progress ring",
  parameters: {
    docs: {
      description: {
        story:
          "Overlays a progress ring on the base icon — for upload/download-style indicators. `undefined` shows the base icon with no ring at all; drag to 0 to see the (still visible) empty track.",
      },
    },
  },
  render: () => {
    const [progress, setProgress] = createSignal<number | undefined>(40);
    const [simulating, setSimulating] = createSignal(false);
    const href = createFaviconProgress(BASE_ICON, progress);

    // The interval's lifetime is tied directly to the `simulating` signal via the effect's
    // apply-phase cleanup — Solid guarantees it's cleared whenever `simulating` flips back to
    // `false` (Clear, manual drag, reaching 100%, or unmount), with no manual timer bookkeeping.
    createEffect(
      () => simulating(),
      isSimulating => {
        if (!isSimulating) return;
        const id = setInterval(() => {
          setProgress(p => {
            const next = (p ?? 0) + 5;
            if (next >= 100) {
              setSimulating(false);
              return 100;
            }
            return next;
          });
        }, 120);
        return () => clearInterval(id);
      },
    );

    return (
      <Container width={320}>
        <IconPreview
          href={href()}
          label={progress() === undefined ? "no ring" : `${progress()}%`}
        />

        <input
          type="range"
          min="0"
          max="100"
          value={progress() ?? 0}
          onInput={e => {
            setSimulating(false);
            setProgress(Number(e.currentTarget.value));
          }}
          style={{ width: "100%" }}
        />

        <ButtonRow>
          <Button
            onClick={() => {
              setProgress(0);
              setSimulating(true);
            }}
            variant="secondary"
          >
            Simulate upload
          </Button>
          <Button
            onClick={() => {
              setSimulating(false);
              setProgress(undefined);
            }}
            variant="outline"
          >
            Clear
          </Button>
        </ButtonRow>

        <Section title="State">
          <Show
            when={progress() !== undefined}
            fallback={
              <span style={{ color: colors.muted, "font-size": font.sizeSm }}>no ring</span>
            }
          >
            <StatRow label="progress" value={`${progress()}%`} />
          </Show>
        </Section>
      </Container>
    );
  },
});
