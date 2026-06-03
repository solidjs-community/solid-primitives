import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createInfiniteScroll, createPagination, createSegment } from "../src/index.js";
import readme from "../README.md?raw";
import {
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Container,
  Section,
  Separator,
  StatRow,
} from "../../../.storybook/ui/index.js";
import { colors, font, radii } from "../../../.storybook/ui/tokens.js";

const meta = preview.meta({
  title: "UI Patterns/Pagination",
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

const PaginationBar = (barProps: {
  props: ReturnType<typeof createPagination>[0];
  center?: boolean;
}) => (
  <nav
    style={{
      display: "flex",
      gap: "0.25rem",
      "flex-wrap": "wrap",
      ...(barProps.center ? { "justify-content": "center" } : {}),
    }}
  >
    <For each={barProps.props()}>
      {props => (
        <Button
          onClick={props.onClick as () => void}
          disabled={props.disabled}
          variant={props["aria-current"] ? "primary" : "outline"}
          style={{ "min-width": "2rem", "font-size": font.sizeSm, padding: "0.3rem 0.6rem" }}
        >
          {props.children as string}
        </Button>
      )}
    </For>
  </nav>
);

export const CreatePaginationStory = meta.story({
  name: "createPagination",
  parameters: {
    docs: {
      description: {
        story:
          "`createPagination` returns a reactive array of button props alongside `page` and `setPage`. Each prop object's `aria-current` and `disabled` are reactive getters — object identity is stable so `<For>` only touches changed DOM attributes when the page changes.",
      },
    },
  },
  render: () => {
    const [totalPages, setTotalPages] = createSignal(20);
    const [maxVisible, setMaxVisible] = createSignal(7);
    const [paginationProps, page, setPage] = createPagination(() => ({
      pages: totalPages(),
      maxPages: maxVisible(),
    }));

    return (
      <Container minWidth={400}>
        <StatRow label="Current page" value={page()} />
        <PaginationBar props={paginationProps} />
        <Separator />
        <Section title="Max visible">
          <ButtonRow>
            {([5, 7, 10] as const).map(n => (
              <Button
                variant={maxVisible() === n ? "primary" : "outline"}
                onClick={() => setMaxVisible(n)}
              >
                {n}
              </Button>
            ))}
          </ButtonRow>
        </Section>
        <Section title="Total pages">
          <ButtonRow>
            {([10, 20, 50] as const).map(n => (
              <Button
                variant={totalPages() === n ? "primary" : "outline"}
                onClick={() => setTotalPages(n)}
              >
                {n}
              </Button>
            ))}
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});

export const CreateSegmentStory = meta.story({
  name: "createSegment",
  parameters: {
    docs: {
      description: {
        story:
          "`createSegment` slices a reactive array to the current page window. The result only updates when the slice boundaries or array content actually change — if the array grows but the current page's slice is unaffected, no update is triggered.",
      },
    },
  },
  render: () => {
    const ITEMS = Array.from({ length: 50 }, (_, i) => `Item ${String(i + 1).padStart(2, "0")}`);
    const [limit, setLimit] = createSignal(8);
    const [paginationProps, page] = createPagination(() => ({
      pages: Math.ceil(ITEMS.length / limit()),
      maxPages: 5,
      showFirst: false,
      showLast: false,
    }));
    const segment = createSegment(ITEMS, limit, page);

    return (
      <Container minWidth={320}>
        <StatRow label="Page" value={`${page()} / ${Math.ceil(ITEMS.length / limit())}`} />
        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(4, 1fr)",
            gap: "0.3rem",
            "min-height": "4.5rem",
          }}
        >
          <For each={segment()}>
            {item => (
              <div
                style={{
                  padding: "0.3rem 0.25rem",
                  "text-align": "center",
                  "font-size": font.sizeSm,
                  "font-family": font.mono,
                  background: colors.secondary,
                  "border-radius": radii.sm,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {item}
              </div>
            )}
          </For>
        </div>
        <PaginationBar props={paginationProps} center />
        <Separator />
        <Section title="Items per page">
          <ButtonRow>
            {([5, 8, 10, 25] as const).map(n => (
              <Button variant={limit() === n ? "primary" : "outline"} onClick={() => setLimit(n)}>
                {n}
              </Button>
            ))}
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});

export const CreateInfiniteScrollStory = meta.story({
  name: "createInfiniteScroll",
  parameters: {
    docs: {
      description: {
        story:
          "`createInfiniteScroll` accumulates fetched pages and exposes `fetching`, `end`, and `error` signals. In production, attach `ref={sentinel}` to a DOM element at the bottom of the list — `IntersectionObserver` calls `setPage` automatically when it scrolls into view. This demo drives `setPage` manually to show the state machine.",
      },
    },
  },
  render: () => {
    // 4 pages × 6 items = 24 items, page>=4 signals end.
    // createInfiniteScroll starts page at 0; the deferred effect fires first
    // so fetcher(0) is always the initial call regardless of IO timing.
    const mockFetcher = async (page: number): Promise<string[]> => {
      await new Promise<void>(resolve => setTimeout(resolve, 600));
      if (page >= 4) return [];
      return Array.from(
        { length: 6 },
        (_, i) => `Item ${String(page * 6 + i + 1).padStart(2, "0")}`,
      );
    };

    // sentinel is intentionally unused — IO-based auto-loading needs a page-level
    // scroll context that Storybook's iframe doesn't provide.
    const [pages, , { page, fetching, end, setPage, error }] = createInfiniteScroll(mockFetcher);

    return (
      <Container width={320}>
        <StatRow label="Page fetched" value={page()} />
        <div
          style={{
            height: "200px",
            overflow: "auto",
            border: `1px solid ${colors.border}`,
            "border-radius": radii.md,
            padding: "0.4rem",
            display: "flex",
            "flex-direction": "column",
            gap: "0.25rem",
          }}
        >
          <For each={pages()}>
            {item => (
              <div
                style={{
                  padding: "0.4rem 0.75rem",
                  background: colors.secondary,
                  "border-radius": radii.sm,
                  "font-size": font.sizeSm,
                  "font-family": font.mono,
                  border: `1px solid ${colors.border}`,
                  "flex-shrink": "0",
                }}
              >
                {item}
              </div>
            )}
          </For>
        </div>
        <Show when={!end()}>
          <Button variant="outline" disabled={fetching()} onClick={() => setPage(p => p + 1)}>
            {fetching() ? "Loading…" : "Load next page"}
          </Button>
        </Show>
        <Show when={end()}>
          <Badge variant={error() ? "error" : "success"}>
            {error() ? String(error()) : "All pages loaded"}
          </Badge>
        </Show>
        <Separator />
        <BoolRow label="fetching" value={fetching()} />
        <BoolRow label="end" value={end()} />
      </Container>
    );
  },
});
