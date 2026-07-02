import { fromJSONStream } from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import records from "./records.json";
import { createMemo, For, Loading } from "solid-js";
import { makeChunkedTextStream } from "./shared.js";
import { Badge, Card, Container, StatRow, colors, font } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
  parameters: {
    layout: "centered",
  },
});

export default meta;

type PackageExports = { package: string; exports?: string[] };

export const FromJSONStream = meta.story({
  name: "Streaming a JSON package directory",
  parameters: {
    docs: {
      description: {
        story:
          "`fromJSONStream` is `fromStream` plus auto-closing of the partial JSON so every chunk parses successfully, even mid-object. This streams this very repo's package → exports list — newest package on top, so you can watch each card filter in as more of the response arrives.",
      },
    },
  },
  render: () => {
    const stream = makeChunkedTextStream(JSON.stringify(records));
    const items = createMemo(fromJSONStream<[]>(() => stream)) as () => PackageExports[];

    return (
      <Container width={360}>
        <Loading
          fallback={<span style={{ color: colors.muted, "font-size": font.sizeSm }}>Loading…</span>}
        >
          <StatRow label="Packages Parsed" value={items().length} />
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "0.5rem",
              "max-height": "360px",
              "overflow-y": "auto",
            }}
          >
            <For each={[...items()].reverse()}>
              {row => (
                <Card>
                  <div
                    style={{
                      display: "flex",
                      "justify-content": "space-between",
                      "align-items": "baseline",
                    }}
                  >
                    <strong style={{ "font-family": font.mono, "font-size": font.sizeBase }}>
                      {row.package}
                    </strong>
                    <span style={{ color: colors.muted, "font-size": font.sizeSm }}>
                      {(row.exports ?? []).length} export
                      {(row.exports ?? []).length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div style={{ display: "flex", "flex-wrap": "wrap", gap: "0.3rem" }}>
                    <For each={row.exports ?? []}>{name => <Badge>{name}</Badge>}</For>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </Loading>
      </Container>
    );
  },
});
