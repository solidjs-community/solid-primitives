import preview from "../../../.storybook/preview.js";
import { createLocationState } from "@solid-primitives/url";
import readme from "../README.md?raw";
import { Button, ButtonRow, Container, Section, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/URL",
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

export const LocationState = meta.story({
  name: "Push, replace & hash",
  parameters: {
    docs: {
      description: {
        story:
          "`createLocationState` reflects `window.location` reactively, and updates on back/forward navigation, `#hash` changes, and `history.pushState`/`replaceState` — including calls made outside this primitive. `push`/`replace` accept a partial record or a `(key, value)` pair; this demo pushes/replaces this *story's own iframe* URL, so it's safe to click around. `navigate` (not wired to a button here, since it forces a full page reload) overwrites `location.href` directly.",
      },
    },
  },
  render: () => {
    const [location, { push, replace }] = createLocationState();

    return (
      <Container width={360}>
        <Section title="state">
          <StatRow label="pathname" value={location.pathname} />
          <StatRow label="search" value={location.search || "(empty)"} />
          <StatRow label="hash" value={location.hash || "(empty)"} />
        </Section>

        <Section title="push — adds a history entry">
          <ButtonRow>
            <Button onClick={() => push({ pathname: "/demo/a" })} variant="outline">
              /demo/a
            </Button>
            <Button onClick={() => push({ pathname: "/demo/b" })} variant="outline">
              /demo/b
            </Button>
            <Button onClick={() => push("hash", "section-1")} variant="outline">
              #section-1
            </Button>
          </ButtonRow>
        </Section>

        <Section title="replace — no new history entry">
          <ButtonRow>
            <Button onClick={() => replace("search", `?ts=${Date.now()}`)} variant="secondary">
              set ?ts=…
            </Button>
            <Button onClick={() => replace({ pathname: "/", search: "", hash: "" })}>reset</Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});
