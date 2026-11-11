import { createSignal, For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createURL } from "@solid-primitives/url";
import { Button, ButtonRow, Container, Section, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/URL",
  parameters: {
    layout: "centered",
  },
});

export default meta;

const INITIAL = "https://shop.example.com/products?category=shoes&sort=price";

export const ReactiveURLFields = meta.story({
  name: "Granular reactive fields",
  parameters: {
    docs: {
      description: {
        story:
          "`createURL` returns a `ReactiveURL` — same interface as the native `URL` class, but every getter is granularly reactive. Editing `pathname` doesn't touch `search` or `hash`, and vice versa.",
      },
    },
  },
  render: () => {
    const url = createURL(INITIAL);
    const paths = ["/products", "/products/sneakers", "/checkout"];
    const [pathIdx, setPathIdx] = createSignal(0);

    return (
      <Container width={420}>
        <Section title="url">
          <StatRow label="href" value={url.href} />
          <StatRow label="pathname" value={url.pathname} />
          <StatRow label="search" value={url.search} />
          <StatRow label="hash" value={url.hash || "(empty)"} />
        </Section>

        <ButtonRow>
          <For each={paths}>
            {(p, i) => (
              <Button
                onClick={() => {
                  setPathIdx(i());
                  url.pathname = p;
                }}
                variant={pathIdx() === i() ? "primary" : "outline"}
              >
                {p}
              </Button>
            )}
          </For>
        </ButtonRow>
        <ButtonRow>
          <Button onClick={() => (url.hash = `section-${Date.now() % 1000}`)} variant="secondary">
            set hash
          </Button>
          <Button onClick={() => (url.hash = "")} variant="ghost">
            clear hash
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

export const TwoWaySearchParamsSync = meta.story({
  name: ".search ↔ .searchParams sync",
  parameters: {
    docs: {
      description: {
        story:
          "`url.searchParams` returns a `ReactiveSearchParams` kept in sync with `url.search` in both directions — the reference is stable, so it can be destructured once. Mutating either side updates the other.",
      },
    },
  },
  render: () => {
    const url = createURL(INITIAL);
    const { searchParams } = url;

    return (
      <Container width={420}>
        <Section title="url.search (edited directly)">
          <StatRow label="search" value={url.search} />
          <ButtonRow>
            <Button onClick={() => (url.search = "?category=boots&sort=newest")} variant="outline">
              set search
            </Button>
            <Button onClick={() => (url.search = "")} variant="ghost">
              clear
            </Button>
          </ButtonRow>
        </Section>

        <Section title="url.searchParams (edited via the class)">
          <StatRow label="toString()" value={searchParams.toString() || "(empty)"} />
          <StatRow label="get('category')" value={searchParams.get("category") ?? "—"} />
          <ButtonRow>
            <Button onClick={() => searchParams.set("category", "sandals")} variant="outline">
              set category
            </Button>
            <Button onClick={() => searchParams.append("tag", "sale")} variant="outline">
              append tag
            </Button>
            <Button onClick={() => searchParams.delete("sort")} variant="ghost">
              delete sort
            </Button>
          </ButtonRow>
        </Section>
      </Container>
    );
  },
});
