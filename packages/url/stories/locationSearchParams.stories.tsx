import { For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createLocationSearchParams } from "@solid-primitives/url";
import { Button, ButtonRow, Container, Section, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/URL",
  parameters: {
    layout: "centered",
  },
});

export default meta;

const TABS = ["overview", "details", "reviews"];

export const LocationSearchParams = meta.story({
  name: "Bound to window.location.search",
  parameters: {
    docs: {
      description: {
        story:
          "`createLocationSearchParams` provides a reactive record of `window.location.search`, updating whenever the URL's search params change — including from back/forward navigation — with `push`/`replace`/`navigate` setters. `push(name, value)` updates a single param, keeping the rest of the query string intact.",
      },
    },
  },
  render: () => {
    const [params, { push }] = createLocationSearchParams();

    return (
      <Container width={360}>
        <Section title="location.search">
          <StatRow label="raw" value={location.search || "(empty)"} />
        </Section>

        <Section title="tab param">
          <StatRow label="params.tab" value={(params.tab as string) ?? "—"} />
          <ButtonRow>
            <For each={TABS}>
              {tab => (
                <Button
                  onClick={() => push("tab", tab)}
                  variant={params.tab === tab ? "primary" : "outline"}
                >
                  {tab}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>

        <Section title="page param">
          <StatRow label="params.page" value={(params.page as string) ?? "—"} />
          <ButtonRow>
            <Button
              onClick={() => push("page", String(Number(params.page ?? "1") + 1))}
              variant="outline"
            >
              next page
            </Button>
            <Button onClick={() => push({})} variant="ghost">
              clear all
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});
