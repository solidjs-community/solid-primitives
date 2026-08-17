import {
  createAggregated,
  createAbortable,
  fromJSONStream,
  fromStream,
  makeAbortable,
  makeRetrying,
} from "@solid-primitives/async";
import preview from "../../../.storybook/preview.js";
import data from "./data.json";
import records from "./records.json";
import { createMemo, createSignal, For, Loading, onCleanup, isPending, Errored } from "solid-js";
import readme from "../README.md?raw";
import { autoSuggest, makeChunkedTextStream } from "./shared.js";
import {
  Alert,
  Badge,
  Button,
  ButtonRow,
  Card,
  Container,
  EventLog,
  Section,
  StatRow,
  colors,
  font,
  inputStyle,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Reactivity/Async",
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

type PackageExports = { package: string; exports?: string[] };

export const Abortable = meta.story({
  name: "Auto-suggest that cancels stale requests",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAbortable` aborts the in-flight request whenever a new one starts, so only the response for the latest keystroke ever resolves — the classic auto-suggest pattern. Call `abort()` yourself on cleanup when not using `createAbortable`.",
      },
    },
  },
  render: () => {
    const [query, setQuery] = createSignal("");
    const [signal, abort, filterAbortError] = makeAbortable();
    onCleanup(abort);
    const suggestions = createMemo(() =>
      autoSuggest(query(), signal(), data).catch(filterAbortError),
    );

    return (
      <Container width={320}>
        <input
          value={query()}
          onInput={e => setQuery(e.currentTarget.value)}
          placeholder="Type to search…"
          style={inputStyle}
        />
        <Loading
          fallback={
            <span style={{ color: colors.muted, "font-size": font.sizeSm }}>Searching…</span>
          }
        >
          <Card>
            <For
              each={suggestions() ?? []}
              fallback={
                <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>No matches</span>
              }
            >
              {segments => (
                <div style={{ "font-family": font.mono, "font-size": font.sizeBase }}>
                  <For each={segments}>
                    {([text, matched]) =>
                      matched ? <strong style={{ color: colors.primary }}>{text}</strong> : text
                    }
                  </For>
                </div>
              )}
            </For>
          </Card>
        </Loading>
      </Container>
    );
  },
});

export const AbortableWithAutoCleanup = meta.story({
  name: "Auto-suggest with automatic cleanup",
  parameters: {
    docs: {
      description: {
        story:
          "`createAbortable` behaves exactly like `makeAbortable`, but also aborts automatically on cleanup — no manual `onCleanup(abort)` required.",
      },
    },
  },
  render: () => {
    const [query, setQuery] = createSignal("");
    const [signal, , filterAbortError] = createAbortable();
    const suggestions = createMemo(() =>
      autoSuggest(query(), signal(), data).catch(filterAbortError),
    );

    return (
      <Container width={320}>
        <input
          value={query()}
          onInput={e => setQuery(e.currentTarget.value)}
          placeholder="Type to search…"
          style={inputStyle}
        />
        <Loading
          fallback={
            <span style={{ color: colors.muted, "font-size": font.sizeSm }}>Searching…</span>
          }
        >
          <Card>
            <For
              each={suggestions() ?? []}
              fallback={
                <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>No matches</span>
              }
            >
              {segments => (
                <div style={{ "font-family": font.mono, "font-size": font.sizeBase }}>
                  <For each={segments}>
                    {([text, matched]) =>
                      matched ? <strong style={{ color: colors.primary }}>{text}</strong> : text
                    }
                  </For>
                </div>
              )}
            </For>
          </Card>
        </Loading>
      </Container>
    );
  },
});

export const FromStream = meta.story({
  name: "Streaming text response",
  parameters: {
    docs: {
      description: {
        story:
          "`fromStream` wraps a Web Stream `ReadableStream` or streaming `Response` so it can be consumed as a memo, growing as each chunk arrives. This demo trickles JSON text in over 16 packets, 200 ms apart — newest chunk on top, so you can watch each one filter in.",
      },
    },
  },
  render: () => {
    const stream = makeChunkedTextStream(JSON.stringify(data));
    const text = createMemo(fromStream(() => stream));

    const PREVIEW_LENGTH = 48;
    let seenLength = 0;
    const chunks = createMemo<{ label: string; time: string }[]>((prev = []) => {
      const value = text();
      if (value.length <= seenLength) return prev;
      const delta = value.slice(seenLength);
      seenLength = value.length;
      const label = delta.length > PREVIEW_LENGTH ? `${delta.slice(0, PREVIEW_LENGTH)}…` : delta;
      return [{ label, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 8);
    });

    return (
      <Container width={340}>
        <Loading
          fallback={<span style={{ color: colors.muted, "font-size": font.sizeSm }}>Loading…</span>}
        >
          <EventLog entries={chunks()} />
        </Loading>
      </Container>
    );
  },
});

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

export const Retrying = meta.story({
  name: "Retrying a flaky request",
  parameters: {
    docs: {
      description: {
        story:
          "`makeRetrying` wraps a fetcher and retries it after a delay when it rejects. Both services below reject twice before succeeding — only the retrying one recovers.",
      },
    },
  },
  render: () => {
    class FlakyService {
      #calls = 0;
      get(): Promise<string> {
        return this.#calls++ < 2
          ? Promise.reject(new Error("rejected"))
          : Promise.resolve("it works!");
      }
    }
    const retryingService = new FlakyService();
    const plainService = new FlakyService();
    const retrying = createMemo(makeRetrying(() => retryingService.get(), { delay: 400 }));
    const plain = createMemo(() => plainService.get());

    const errorFallback = (err: () => unknown, reset: () => void) => (
      <Alert variant="error">
        Failed: {err() instanceof Error ? (err() as Error).message : "unknown error"}{" "}
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
      </Alert>
    );

    return (
      <Container width={320}>
        <Section title="With makeRetrying">
          <Errored fallback={errorFallback}>
            {isPending(retrying) ? (
              <Badge variant="warning">retrying…</Badge>
            ) : (
              <Badge variant="success">{retrying()}</Badge>
            )}
          </Errored>
        </Section>
        <Section title="Without retrying">
          <Errored fallback={errorFallback}>
            {isPending(plain) ? (
              <Badge variant="default">loading…</Badge>
            ) : (
              <Badge variant="success">{plain()}</Badge>
            )}
          </Errored>
        </Section>
      </Container>
    );
  },
});

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
