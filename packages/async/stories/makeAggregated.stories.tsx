import { createAggregated } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import { createSignal, For } from "solid-js";
import {
  Button,
  ButtonRow,
  Container,
  StatRow,
  colors,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const Aggregation = meta.story({
  name: "Infinite scroll page list",
  parameters: {
    docs: {
      description: {
        story:
          '`createAggregated` appends each new value from an accessor onto the previous result instead of replacing it — here every "page" gets pushed onto a running list.',
      },
    },
  },
  render: () => {
    const [currentPage, setCurrentPage] = createSignal(1);
    const aggregated = createAggregated(currentPage, [] as number[]);
    const pages = () => aggregated() as number[];

    return (
      <Container width={280}>
        <StatRow label="Pages Loaded" value={pages().length} />
        <div
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "0.4rem",
            "max-height": "200px",
            "overflow-y": "auto",
          }}
        >
          <For each={pages()}>
            {page => (
              <div
                style={{
                  padding: "0.5rem 0.75rem",
                  background: colors.surface,
                  "border-radius": radii.md,
                }}
              >
                Page {page}
              </div>
            )}
          </For>
        </div>
        <ButtonRow>
          <Button onClick={() => setCurrentPage(page => page + 1)}>Load next page</Button>
        </ButtonRow>
      </Container>
    );
  },
});
