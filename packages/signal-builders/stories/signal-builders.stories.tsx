import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  push,
  filter,
  sort,
  capitalize,
  lowercase,
  template,
  multiply,
  divide,
  substract,
  round,
  clamp,
  update,
  merge,
  get,
  int,
  add,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  Separator,
  StatRow,
  ValueDisplay,
  Badge,
  TextField,
  colors,
  font,
} from "../../../.storybook/ui/index.js";
import { compare } from "@solid-primitives/utils";

const meta = preview.meta({
  title: "Reactivity/Signal Builders",
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

// ── Story 1: Array pipeline ───────────────────────────────────────────────────

export const ArrayPipeline = meta.story({
  name: "Sort & filter pipeline",
  parameters: {
    docs: {
      description: {
        story:
          "Array builders compose like pipes — `filter` keeps numbers at or above the threshold, `sort` orders the result. The `.removed` count is attached to the return value of `filter`, giving a tally of how many items were dropped.",
      },
    },
  },
  render: () => {
    const POOL = [7, 3, 9, 1, 5, 8, 2, 6, 4];
    const [list, setList] = createSignal([7, 3, 9, 1, 5]);
    const [min, setMin] = createSignal(3);

    // Pipeline: filter → sort
    const filtered = filter(list, (n: number) => n >= min());
    const sorted = sort(filtered, compare);

    return (
      <Container width={300}>
        <Section title="Numbers (click to toggle)">
          <ButtonRow>
            <For each={POOL}>
              {n => (
                <Button
                  variant={list().includes(n) ? "primary" : "outline"}
                  onClick={() =>
                    setList(l => (l.includes(n) ? l.filter(x => x !== n) : [...l, n]))
                  }
                  style={{
                    "min-width": "34px",
                    padding: "0.3rem",
                    "font-family": font.mono,
                    "font-size": font.sizeSm,
                  }}
                >
                  {n}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Section title="Min threshold">
          <ButtonRow>
            <For each={[1, 3, 5, 7]}>
              {t => (
                <Button
                  variant={min() === t ? "primary" : "outline"}
                  onClick={() => setMin(t)}
                  style={{ flex: "1" }}
                >
                  ≥ {t}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Separator />
        <div style={{ display: "flex", gap: "0.35rem", "flex-wrap": "wrap", "min-height": "26px" }}>
          <For each={sorted()}>
            {n => <Badge variant="info">{n}</Badge>}
          </For>
          <Show when={sorted().length === 0}>
            <span style={{ color: colors.muted, "font-size": font.sizeSm }}>no items</span>
          </Show>
        </div>
        <StatRow label="kept" value={sorted().length} />
        <StatRow label="dropped" value={list().length - sorted().length} />
      </Container>
    );
  },
});

// ── Story 2: String pipeline ──────────────────────────────────────────────────

export const StringPipeline = meta.story({
  name: "Name badge formatter",
  parameters: {
    docs: {
      description: {
        story:
          "`capitalize` normalizes each name part, then `template` assembles them into a display name. A second pipeline wraps `template` with `lowercase` to derive a username slug — two reactive outputs from the same two source signals.",
      },
    },
  },
  render: () => {
    const [first, setFirst] = createSignal("jane");
    const [last, setLast] = createSignal("doe");

    // Pipeline A: capitalize each part → assemble
    const displayName = template`${capitalize(first)} ${capitalize(last)}`;
    // Pipeline B: lowercase both → dot-separated slug
    const username = lowercase(template`${first}.${last}`);

    return (
      <Container width={300}>
        <TextField label="First name" value={first()} onChange={setFirst} />
        <TextField label="Last name" value={last()} onChange={setLast} />
        <Separator />
        <ValueDisplay label="displayName" value={displayName()} />
        <ValueDisplay label="username" value={username()} />
      </Container>
    );
  },
});

// ── Story 3: Number pipeline ──────────────────────────────────────────────────

export const NumberPipeline = meta.story({
  name: "Price calculator",
  parameters: {
    docs: {
      description: {
        story:
          "Number builders form an arithmetic pipeline — `multiply` computes the subtotal, `divide` calculates the discount fraction, `round` snaps it to whole dollars, `substract` applies it, and `clamp` enforces a budget ceiling. Each node is a separate `createMemo` that only re-evaluates when its own inputs change.",
      },
    },
  },
  render: () => {
    const MAX = 50;
    const [qty, setQty] = createSignal(3);
    const [price, setPrice] = createSignal(12);
    const [discPct, setDiscPct] = createSignal(20);

    // Pipeline: multiply → divide/round (discount amt) → substract → clamp
    const subtotal = multiply(qty, price);
    const discount = round(divide(multiply(subtotal, discPct), 100));
    const unclamped = substract(subtotal, discount);
    const total = clamp(unclamped, 0, MAX);

    return (
      <Container width={300}>
        <Section title="Qty">
          <ButtonRow>
            <For each={[1, 2, 3, 5, 10]}>
              {n => (
                <Button
                  variant={qty() === n ? "primary" : "outline"}
                  onClick={() => setQty(n)}
                  style={{ flex: "1" }}
                >
                  {n}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Section title="Unit price ($)">
          <ButtonRow>
            <For each={[5, 12, 20, 35]}>
              {n => (
                <Button
                  variant={price() === n ? "primary" : "outline"}
                  onClick={() => setPrice(n)}
                  style={{ flex: "1" }}
                >
                  ${n}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Section title="Discount (%)">
          <ButtonRow>
            <For each={[0, 10, 20, 30]}>
              {n => (
                <Button
                  variant={discPct() === n ? "primary" : "outline"}
                  onClick={() => setDiscPct(n)}
                  style={{ flex: "1" }}
                >
                  {n}%
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Separator />
        <StatRow label="subtotal" value={`$${subtotal()}`} />
        <StatRow label="discount" value={`−$${discount()}`} />
        <StatRow label={`total (max $${MAX})`} value={`$${total()}`} />
        <Show when={unclamped() > MAX}>
          <Badge variant="warning">Capped at ${MAX}</Badge>
        </Show>
      </Container>
    );
  },
});

// ── Story 4: Object pipeline ──────────────────────────────────────────────────

export const ObjectPipeline = meta.story({
  name: "Profile update chain",
  parameters: {
    docs: {
      description: {
        story:
          "`update` immutably sets a nested field, `merge` overlays additional keys on top of the result, and `get` reads a typed key path out of the final object. Editing the last name or switching the role flows through the entire chain in one reactive flush.",
      },
    },
  },
  render: () => {
    const base = { name: { first: "Jane", last: "" }, role: "viewer" };
    const [lastName, setLastName] = createSignal("Doe");
    const [role, setRole] = createSignal("editor");

    // Pipeline: update nested key → merge in role override → read back via get
    const withLast = update(() => base, "name", "last", lastName);
    const merged = merge(withLast, () => ({ role: role() }));
    const fullName = template`${get(merged, "name", "first")} ${get(merged, "name", "last")}`;
    const currentRole = get(merged, "role");

    return (
      <Container width={300}>
        <TextField label="Last name" value={lastName()} onChange={setLastName} />
        <Section title="Role override">
          <ButtonRow>
            {(["viewer", "editor", "admin"]).map(r => (
              <Button
                variant={role() === r ? "primary" : "outline"}
                onClick={() => setRole(r)}
                style={{ flex: "1" }}
              >
                {r}
              </Button>
            ))}
          </ButtonRow>
        </Section>
        <Separator />
        <ValueDisplay label="fullName" value={fullName()} />
        <ValueDisplay label="role" value={String(currentRole())} />
      </Container>
    );
  },
});

// ── Story 5: Cross-category chain ─────────────────────────────────────────────

export const ConvertAndCompute = meta.story({
  name: "Text input → clamped score",
  parameters: {
    docs: {
      description: {
        story:
          "Builders from different categories compose seamlessly: `int` parses the text input into a number, `multiply` scales it, `add` applies a flat bonus, and `clamp` constrains the result. The full chain re-evaluates any time a single input changes.",
      },
    },
  },
  render: () => {
    const [raw, setRaw] = createSignal("20");
    const [multiplier, setMultiplier] = createSignal(3);
    const [cap, setCap] = createSignal(100);

    // Cross-category pipeline: int (convert) → multiply → add → clamp (number)
    const base = multiply(int(raw), multiplier);
    const withBonus = add(base, 10); // flat +10 bonus; add starts from 0 so 0+base+10 = base+10
    const score = clamp(withBonus, 0, cap);

    return (
      <Container width={300}>
        <TextField
          label="Raw score (text)"
          value={raw()}
          onChange={setRaw}
          placeholder="e.g. 20"
          type="number"
        />
        <Section title="Multiplier">
          <ButtonRow>
            <For each={[1, 2, 3, 5]}>
              {n => (
                <Button
                  variant={multiplier() === n ? "primary" : "outline"}
                  onClick={() => setMultiplier(n)}
                  style={{ flex: "1" }}
                >
                  ×{n}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Section title="Cap">
          <ButtonRow>
            <For each={[50, 100, 200]}>
              {n => (
                <Button
                  variant={cap() === n ? "primary" : "outline"}
                  onClick={() => setCap(n)}
                  style={{ flex: "1" }}
                >
                  {n}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>
        <Separator />
        <StatRow label="int(raw)" value={int(raw)()} />
        <StatRow label="× multiplier" value={base()} />
        <StatRow label="+ 10 bonus" value={withBonus()} />
        <StatRow label={`clamped (max ${cap()})`} value={score()} />
        <Show when={withBonus() > cap()}>
          <Badge variant="warning">Capped at {cap()}</Badge>
        </Show>
      </Container>
    );
  },
});
