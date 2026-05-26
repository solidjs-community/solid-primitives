import preview from "../../../.storybook/preview.js";
import * as platform from "@solid-primitives/platform";
import readme from "../README.md?raw";
import { container, Section, BoolRow } from "./_helpers.js";

const meta = preview.meta({
  title: "Utilities/Platform",
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

export const AllDetections = meta.story({
  name: "Platform Detection",
  parameters: {
    docs: {
      description: {
        story:
          "All constants are plain `boolean` values evaluated once at module load time from `navigator.userAgent` and browser API checks. Green = `true` for the current browser.",
      },
    },
  },
  render: () => (
    <div style={container}>
      <h3 style={{ margin: 0 }}>Current Environment</h3>

      <Section title="Device">
        <BoolRow label="isAndroid" value={platform.isAndroid} />
        <BoolRow label="isWindows" value={platform.isWindows} />
        <BoolRow label="isMac" value={platform.isMac} />
        <BoolRow label="isIPhone" value={platform.isIPhone} />
        <BoolRow label="isIPad" value={platform.isIPad} />
        <BoolRow label="isIPod" value={platform.isIPod} />
        <BoolRow label="isIOS" value={platform.isIOS} />
        <BoolRow label="isAppleDevice" value={platform.isAppleDevice} />
        <BoolRow label="isMobile" value={platform.isMobile} />
      </Section>

      <Section title="Browser">
        <BoolRow label="isFirefox" value={platform.isFirefox} />
        <BoolRow label="isOpera" value={platform.isOpera} />
        <BoolRow label="isSafari" value={platform.isSafari} />
        <BoolRow label="isIE" value={platform.isIE} />
        <BoolRow label="isChromium" value={platform.isChromium} />
        <BoolRow label="isEdge" value={platform.isEdge} />
        <BoolRow label="isChrome" value={platform.isChrome} />
        <BoolRow label="isBrave" value={platform.isBrave} />
      </Section>

      <Section title="Rendering Engine">
        <BoolRow label="isGecko" value={platform.isGecko} />
        <BoolRow label="isBlink" value={platform.isBlink} />
        <BoolRow label="isWebKit" value={platform.isWebKit} />
        <BoolRow label="isPresto" value={platform.isPresto} />
        <BoolRow label="isTrident" value={platform.isTrident} />
        <BoolRow label="isEdgeHTML" value={platform.isEdgeHTML} />
      </Section>
    </div>
  ),
});

export const ConditionalRendering = meta.story({
  name: "Conditional Rendering",
  parameters: {
    docs: {
      description: {
        story:
          "Because the constants are plain booleans (not signals), they slot naturally into `Show`, `Switch/Match`, or plain `if` statements without any reactivity overhead.",
      },
    },
  },
  render: () => {
    const device = platform.isIOS
      ? "iOS"
      : platform.isAndroid
        ? "Android"
        : platform.isWindows
          ? "Windows"
          : platform.isMac
            ? "macOS"
            : "Unknown OS";

    const browser = platform.isChrome
      ? "Chrome"
      : platform.isFirefox
        ? "Firefox"
        : platform.isSafari
          ? "Safari"
          : platform.isEdge
            ? "Edge"
            : platform.isBrave
              ? "Brave"
              : platform.isOpera
                ? "Opera"
                : "Unknown Browser";

    const engine = platform.isBlink
      ? "Blink"
      : platform.isGecko
        ? "Gecko"
        : platform.isWebKit
          ? "WebKit"
          : platform.isTrident
            ? "Trident"
            : "Unknown Engine";

    const badge = (label: string, color: string) => (
      <span
        style={{
          display: "inline-block",
          padding: "0.3rem 0.75rem",
          background: color,
          color: "white",
          "border-radius": "999px",
          "font-size": "0.85rem",
          "font-weight": "600",
          "font-family": "system-ui",
        }}
      >
        {label}
      </span>
    );

    return (
      <div style={container}>
        <h3 style={{ margin: 0 }}>You are running…</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <span style={{ color: "#64748b", "font-size": "0.85rem", width: "60px" }}>Device</span>
            {badge(device, "#6366f1")}
          </div>
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <span style={{ color: "#64748b", "font-size": "0.85rem", width: "60px" }}>Browser</span>
            {badge(browser, "#0ea5e9")}
          </div>
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <span style={{ color: "#64748b", "font-size": "0.85rem", width: "60px" }}>Engine</span>
            {badge(engine, "#10b981")}
          </div>
          <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
            <span style={{ color: "#64748b", "font-size": "0.85rem", width: "60px" }}>Mobile</span>
            {badge(platform.isMobile ? "Yes" : "No", platform.isMobile ? "#f59e0b" : "#94a3b8")}
          </div>
        </div>

        <p
          style={{
            margin: 0,
            "font-size": "0.78rem",
            color: "#94a3b8",
            "border-top": "1px solid #e2e8f0",
            "padding-top": "0.75rem",
          }}
        >
          These are compile-time constants — no signals, no overhead.
        </p>
      </div>
    );
  },
});
