import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createFaviconBadge } from "@solid-primitives/favicon";
import { Button, ButtonRow, Container, Section, StatRow } from "../../../.storybook/ui/index.js";
import { svgIcon, IconPreview } from "./_helpers.js";

const meta = preview.meta({
  title: "Browser APIs/Favicon",
});

export default meta;

const BASE_ICON = svgIcon("#6366f1");

export const NotificationBadge = meta.story({
  name: "Unread count badge",
  parameters: {
    docs: {
      description: {
        story:
          'Overlays a notification count on the base icon, the way native apps decorate their dock/taskbar icon. `0` renders no badge; numbers clamp to `"{max}+"` past `max` (default 99).',
      },
    },
  },
  render: () => {
    const [count, setCount] = createSignal(3);
    const href = createFaviconBadge(BASE_ICON, count, { max: 9 });

    return (
      <Container width={320}>
        <IconPreview href={href()} label={count() === 0 ? "no badge" : `badge: ${count()}`} />

        <ButtonRow>
          <Button onClick={() => setCount(c => Math.max(0, c - 1))} variant="outline">
            − 1
          </Button>
          <Button onClick={() => setCount(c => c + 1)} variant="outline">
            + 1
          </Button>
          <Button onClick={() => setCount(0)} variant="secondary">
            Clear
          </Button>
        </ButtonRow>

        <Section title="State">
          <StatRow label="count" value={count()} />
        </Section>
      </Container>
    );
  },
});
