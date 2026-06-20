import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createConnectivitySignal,
  createNetworkInformation,
  makeNetworkInformation,
  type NetworkState,
} from "@solid-primitives/connectivity";
import readme from "../README.md?raw";
import {
  Container,
  Card,
  Section,
  StatRow,
  BoolRow,
  Badge,
  Alert,
  EventLog,
  colors,
  font,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Network/Connectivity",
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

// ---------------------------------------------------------------------------
// Story 1 — createConnectivitySignal
// ---------------------------------------------------------------------------

export const OnlineOfflineBadge = meta.story({
  name: "Online / offline status",
  parameters: {
    docs: {
      description: {
        story:
          "`createConnectivitySignal()` returns a reactive `Accessor<boolean>` that mirrors `navigator.onLine`. It re-fires whenever the browser's online/offline state changes. `useConnectivitySignal()` is a singleton-root variant that reuses a single listener across all callers — prefer it inside components.",
      },
    },
  },
  render: () => {
    const isOnline = createConnectivitySignal();

    return (
      <Container width={300}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
          }}
        >
          <span style={{ "font-size": font.sizeBase, color: colors.muted }}>isOnline()</span>
          <Badge variant={isOnline() ? "success" : "error"}>{isOnline() ? "true" : "false"}</Badge>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              "align-items": "center",
              gap: "0.6rem",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                "border-radius": "50%",
                background: isOnline() ? colors.success : "#ef4444",
                "flex-shrink": "0",
              }}
            />
            <span
              style={{
                "font-size": font.sizeMd,
                "font-weight": "600",
                color: isOnline() ? colors.success : "#ef4444",
              }}
            >
              {isOnline() ? "Connected" : "Offline"}
            </span>
          </div>
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>
            navigator.onLine = {String(isOnline())}
          </span>
        </Card>

        <Alert variant="info">Toggle: DevTools → Network → throttle preset → Offline</Alert>
      </Container>
    );
  },
});

// ---------------------------------------------------------------------------
// Story 2 — createNetworkInformation
// ---------------------------------------------------------------------------

function qualityFromNetwork(
  effectiveType: string | undefined,
  saveData: boolean | undefined,
): { label: string; variant: "success" | "warning" | "error" | "default" } {
  if (effectiveType === undefined) return { label: "—", variant: "default" };
  if (saveData) return { label: "low (save-data)", variant: "error" };
  if (effectiveType === "4g") return { label: "high", variant: "success" };
  if (effectiveType === "3g") return { label: "medium", variant: "warning" };
  return { label: "low", variant: "error" };
}

export const ConnectionQualitySignals = meta.story({
  name: "Connection quality signals",
  parameters: {
    docs: {
      description: {
        story:
          "`createNetworkInformation()` returns independent reactive signals for every property of `navigator.connection` alongside `online`. Each signal updates individually when its value changes, so components subscribe only to what they need. `useNetworkInformation()` is the singleton-root variant. Network Information API properties are `undefined` in Firefox and Safari.",
      },
    },
  },
  render: () => {
    const { online, effectiveType, downlink, downlinkMax, rtt, saveData, type } =
      createNetworkInformation();

    const supported = () => effectiveType() !== undefined;
    const quality = () => qualityFromNetwork(effectiveType(), saveData());

    return (
      <Container width={340}>
        <Card>
          <BoolRow label="online" value={online()} />

          <Show
            when={supported()}
            fallback={
              <span style={{ "font-size": font.sizeSm, color: colors.muted }}>
                Network Info API not available in this browser
              </span>
            }
          >
            <StatRow label="effectiveType" value={effectiveType() ?? "—"} />
            <StatRow
              label="downlink"
              value={downlink() !== undefined ? `${downlink()} Mbit/s` : "—"}
            />
            <StatRow label="rtt" value={rtt() !== undefined ? `${rtt()} ms` : "—"} />
            <BoolRow label="saveData" value={saveData() ?? false} />
            <StatRow label="type" value={type() ?? "—"} />
            <Show when={downlinkMax() !== undefined}>
              <StatRow label="downlinkMax" value={`${downlinkMax()} Mbit/s`} />
            </Show>
          </Show>
        </Card>

        <Show when={supported()}>
          <Section title="Adaptive quality">
            <div
              style={{
                display: "flex",
                "align-items": "center",
                "justify-content": "space-between",
                "font-size": font.sizeBase,
              }}
            >
              <span style={{ color: colors.muted }}>Suggested asset quality</span>
              <Badge variant={quality().variant}>{quality().label}</Badge>
            </div>
            <span style={{ "font-size": font.sizeSm, color: colors.mutedFg }}>
              4g + !saveData → high · 3g → medium · 2g/slow-2g → low
            </span>
          </Section>
        </Show>

        <Alert variant="info">Throttle: DevTools → Network → set a connection preset</Alert>
      </Container>
    );
  },
});

// ---------------------------------------------------------------------------
// Story 3 — makeNetworkInformation
// ---------------------------------------------------------------------------

function formatEntry(s: NetworkState): { label: string; time: string } {
  const label = s.online ? "online" : "offline";
  const parts: string[] = [];
  if (s.effectiveType) parts.push(s.effectiveType);
  if (s.downlink !== undefined) parts.push(`${s.downlink} Mb/s`);
  if (s.rtt !== undefined) parts.push(`${s.rtt} ms`);
  const details = parts.length ? `${parts.join(" · ")}  ` : "";
  return { label, time: `${details}${new Date().toLocaleTimeString()}` };
}

export const NetworkChangeLog = meta.story({
  name: "Network change log",
  parameters: {
    docs: {
      description: {
        story:
          "`makeNetworkInformation(callback)` is the low-level variant — no Solid lifecycle, no signals. The callback receives a `NetworkState` snapshot every time the browser fires an online/offline event or `navigator.connection` emits a change event. It does **not** fire with the initial state; read `navigator.onLine` and `navigator.connection` directly if you need that.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);

    makeNetworkInformation(state => {
      setLog(prev => [formatEntry(state), ...prev].slice(0, 8));
    });

    return (
      <Container width={340}>
        <EventLog entries={log()} />
        <Alert variant="info">
          Trigger events: DevTools → Network → toggle Offline, or change throttle preset
        </Alert>
        <span style={{ "font-size": font.sizeSm, color: colors.muted }}>
          No entry fires on mount — only on state changes.
        </span>
      </Container>
    );
  },
});
