import { createSignal, createStore, latest, untrack } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makePersisted, cookieStorage } from "../src/index.js";
import readme from "../README.md?raw";
import {
  Button,
  ButtonRow,
  Code,
  Container,
  Section,
  StatRow,
  TextField,
  ValueDisplay,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Storage",
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

export const MakePersistedSignal = meta.story({
  name: "makePersisted — signal (localStorage)",
  parameters: {
    docs: {
      description: {
        story:
          "`makePersisted(createSignal(initial), options)` wraps a signal so every write is mirrored to `localStorage` and the stored value is restored on page load. Setting the signal to `null` or `undefined` removes the key entirely. Change the value below, then reload — the input will show the last persisted value.",
      },
    },
  },
  render: () => {
    const [value, setValue] = makePersisted(createSignal("hello"), {
      name: "sp_demo_signal",
    });

    return (
      <Container width={360}>
        <TextField
          label="Persisted value"
          value={untrack(value) as string}
          onChange={v => setValue(v)}
          placeholder="type something…"
        />

        <Section title="Signal state">
          <StatRow label="value()" value={String(latest(value))} />
          <StatRow label="storage key" value="sp_demo_signal" />
          <StatRow label="storage" value="localStorage" />
        </Section>

        <ButtonRow>
          <Button onClick={() => setValue(undefined as any)} variant="ghost">
            Clear (remove key)
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

export const MakePersistedStore = meta.story({
  name: "makePersisted — store (localStorage)",
  parameters: {
    docs: {
      description: {
        story:
          "`makePersisted` also accepts a `createStore` tuple. The entire store is serialised as JSON on every mutation and restored on load. Mutations use a function updater — the Solid 2.0 `StoreSetter` API.",
      },
    },
  },
  render: () => {
    const [store, setStore] = makePersisted(createStore({ count: 0, label: "clicks" }), {
      name: "sp_demo_store",
    });

    return (
      <Container width={360}>
        <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
          <Button
            onClick={() =>
              setStore(s => {
                s.count++;
              })
            }
          >
            + Increment
          </Button>
          <span
            style={{
              "font-size": "2rem",
              "font-weight": "700",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {store.count}
          </span>
        </div>

        <Section title="Store state">
          <StatRow label="store.count" value={store.count} />
          <StatRow label="store.label" value={store.label} />
          <StatRow label="storage key" value="sp_demo_store" />
        </Section>

        <ButtonRow>
          <Button
            onClick={() =>
              setStore(s => {
                s.count = 0;
              })
            }
            variant="ghost"
          >
            Reset
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

export const MakePersistedCookies = meta.story({
  name: "makePersisted — cookieStorage",
  parameters: {
    docs: {
      description: {
        story:
          "Pass `{ storage: cookieStorage }` to persist the signal in a browser cookie instead of `localStorage`. `cookieStorage` is a synchronous `Storage`-compatible adapter backed by `document.cookie`. Use `storageOptions` to set cookie attributes like `maxAge` or `path`.",
      },
    },
  },
  render: () => {
    const [username, setUsername] = makePersisted(createSignal(""), {
      name: "sp_demo_cookie_user",
      storage: cookieStorage,
      storageOptions: { maxAge: 60 * 60 * 24 * 7, path: "/" },
    });

    return (
      <Container width={360}>
        <TextField
          label="Username (stored in cookie)"
          value={untrack(username) as string}
          onChange={v => setUsername(v)}
          placeholder="enter username…"
        />

        <Section title="Cookie state">
          <StatRow label="username()" value={String(latest(username))} />
          <StatRow label="cookie name" value="sp_demo_cookie_user" />
          <ValueDisplay label="maxAge" value="7 days" />
        </Section>

        <ButtonRow>
          <Button onClick={() => setUsername(undefined as any)} variant="ghost">
            Clear cookie
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});

export const CustomSerializer = meta.story({
  name: "makePersisted — custom serializer",
  parameters: {
    docs: {
      description: {
        story:
          "Supply `serialize` and `deserialize` to store non-JSON-serializable values or to control the on-disk format. Here a `Date` is stored as an ISO string and restored as a `Date` object. The default serializer is `JSON.stringify` / `JSON.parse`.",
      },
    },
  },
  render: () => {
    const [savedAt, setSavedAt] = makePersisted(createSignal<Date | null>(null), {
      name: "sp_demo_date",
      serialize: (d: Date | null) => d?.toISOString() ?? "",
      deserialize: (s: string) => (s ? new Date(s) : null),
    });

    return (
      <Container width={360}>
        <Button onClick={() => setSavedAt(new Date())}>Save current timestamp</Button>

        <Section title="Persisted date">
          <StatRow label="savedAt()" value={latest(savedAt)?.toLocaleString() ?? "null"} />
          <StatRow label="stored as" value="ISO 8601 string" />
          <StatRow label="storage key" value="sp_demo_date" />
        </Section>

        <ButtonRow>
          <Button onClick={() => setSavedAt(null)} variant="ghost">
            Clear
          </Button>
        </ButtonRow>
      </Container>
    );
  },
});
