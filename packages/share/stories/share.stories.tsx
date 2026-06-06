import { createSignal, For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createSocialShare,
  createWebShare,
  BLUESKY,
  EMAIL,
  FACEBOOK,
  LINKEDIN,
  REDDIT,
  TELEGRAM,
  WHATSAPP,
  X,
} from "@solid-primitives/share";
import type { Network } from "@solid-primitives/share";
import readme from "../README.md?raw";
import {
  Alert,
  Badge,
  BoolRow,
  Button,
  ButtonRow,
  Card,
  Container,
  Section,
  StatRow,
  TextField,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Utilities/Share",
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

const POPULAR_NETWORKS: { label: string; network: Network }[] = [
  { label: "X", network: X },
  { label: "Bluesky", network: BLUESKY },
  { label: "Facebook", network: FACEBOOK },
  { label: "LinkedIn", network: LINKEDIN },
  { label: "Reddit", network: REDDIT },
  { label: "WhatsApp", network: WHATSAPP },
  { label: "Telegram", network: TELEGRAM },
  { label: "Email", network: EMAIL },
];

export const SocialShareStory = meta.story({
  name: "Social network picker",
  parameters: {
    docs: {
      description: {
        story:
          "`createSocialShare` opens a share popup for the chosen network. `isSharing` goes `true` while the popup window is open and resets to `false` when the user closes it.",
      },
    },
  },
  render: () => {
    const { share, isSharing } = createSocialShare(() => ({
      url: "https://primitives.solidjs.community",
      title: "Solid Primitives",
      description: "A library of high-quality primitives for Solid.js",
    }));

    return (
      <Container width={380}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>createSocialShare</h3>

        <Card>
          <StatRow label="url" value="primitives.solidjs.community" />
          <StatRow label="title" value="Solid Primitives" />
          <BoolRow label="isSharing()" value={isSharing()} />
        </Card>

        <Section title="Pick a network">
          <ButtonRow>
            <For each={POPULAR_NETWORKS}>
              {({ label, network }) => (
                <Button variant="outline" onClick={() => share(network)}>
                  {label}
                </Button>
              )}
            </For>
          </ButtonRow>
        </Section>

        <Show when={isSharing()}>
          <Badge variant="info">Popup is open — close it to reset</Badge>
        </Show>
      </Container>
    );
  },
});

export const WebShareStory = meta.story({
  name: "Native share dialog",
  parameters: {
    docs: {
      description: {
        story:
          "`createWebShare` wraps the browser's native Web Share API with reactive state. `pending` is `true` while the dialog is open; `status` is `true` on success or `false` on failure. Requires a secure context and browser support.",
      },
    },
  },
  render: () => {
    const { share, pending, status, message } = createWebShare();

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>createWebShare</h3>

        <Card>
          <BoolRow label="pending()" value={pending()} />
          <StatRow label="status()" value={String(status())} />
          <Show when={message()}>
            <StatRow label="message()" value={message()!} />
          </Show>
        </Card>

        <Show when={status() === true}>
          <Alert variant="info">Shared successfully!</Alert>
        </Show>

        <Show when={status() === false}>
          <Alert variant="error">{message()}</Alert>
        </Show>

        <Button
          disabled={pending()}
          onClick={() =>
            share({
              url: "https://primitives.solidjs.community",
              title: "Solid Primitives",
              text: "A library of high-quality primitives for Solid.js",
            })
          }
        >
          {pending() ? "Sharing…" : "Share this page"}
        </Button>

        <p style={{ margin: 0, "font-size": "0.8rem", color: "#64748b" }}>
          Requires HTTPS and browser support. The error message appears above when the API is
          unavailable or the user cancels.
        </p>
      </Container>
    );
  },
});

export const CustomNetworkStory = meta.story({
  name: "Custom URL template",
  parameters: {
    docs: {
      description: {
        story:
          "Any URL string can be passed as the `network`. Markers `@u`, `@t`, `@d`, `@q`, `@h`, `@m`, and `@tu` are substituted at share time — useful for networks not included in the built-in list.",
      },
    },
  },
  render: () => {
    const [template, setTemplate] = createSignal(
      "https://www.x.com/intent/tweet?text=@t&url=@u",
    );

    const previewUrl = () =>
      template()
        .replace(/@tu/g, "")
        .replace(/@u/g, encodeURIComponent("https://primitives.solidjs.community"))
        .replace(/@t/g, encodeURIComponent("Solid Primitives"))
        .replace(/@d/g, encodeURIComponent("High-quality primitives for Solid.js"))
        .replace(/@q/g, "")
        .replace(/@h/g, "")
        .replace(/@m/g, "");

    const { share } = createSocialShare(() => ({
      url: "https://primitives.solidjs.community",
      title: "Solid Primitives",
      description: "High-quality primitives for Solid.js",
    }));

    return (
      <Container width={440}>
        <h3 style={{ margin: 0, "font-size": "1rem" }}>Custom network URL</h3>

        <TextField
          label="URL template"
          value={template()}
          onChange={setTemplate}
          placeholder="https://example.com/share?url=@u&title=@t"
        />

        <Section title="Markers">
          <p style={{ margin: 0, "font-size": "0.82rem", color: "#64748b", "line-height": "1.7" }}>
            <code>@u</code> url &nbsp;·&nbsp; <code>@t</code> title &nbsp;·&nbsp;{" "}
            <code>@d</code> description &nbsp;·&nbsp; <code>@q</code> quote &nbsp;·&nbsp;{" "}
            <code>@h</code> hashtags &nbsp;·&nbsp; <code>@m</code> media
          </p>
        </Section>

        <Section title="Generated URL">
          <div
            style={{
              "font-family": '"Geist Mono", monospace',
              "font-size": "0.75rem",
              "word-break": "break-all",
              color: "#475569",
              background: "#f8fafc",
              padding: "0.5rem 0.75rem",
              "border-radius": "6px",
              border: "1px solid #e2e8f0",
              "line-height": "1.5",
            }}
          >
            {previewUrl()}
          </div>
        </Section>

        <Button onClick={() => share(template())}>Open share popup</Button>
      </Container>
    );
  },
});
