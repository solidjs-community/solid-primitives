import { For, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createCameras,
  createDevices,
  createMicrophones,
  createSpeakers,
} from "@solid-primitives/devices";
import readme from "../README.md?raw";
import { Badge, colors, Container, font, StatRow } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/Devices",
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

export const AllDevicesStory = meta.story({
  name: "All devices",
  parameters: {
    docs: {
      description: {
        story:
          "`createDevices()` returns a reactive list of all `MediaDeviceInfo` objects enumerated by the browser. The list refreshes automatically on `devicechange` events — plug in or unplug a USB audio/video device to see it update live. Device labels are empty until the user grants camera or microphone permission.",
      },
    },
  },
  render: () => {
    const devices = createDevices();

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": font.sizeMd }}>All media devices</h3>
        <Show
          when={devices().length > 0}
          fallback={
            <div
              style={{
                "font-size": font.sizeSm,
                color: colors.mutedFg,
                padding: "0.75rem",
                background: colors.surface,
                "border-radius": "8px",
                border: `1px solid ${colors.border}`,
              }}
            >
              No devices found. Connect audio/video hardware or grant browser media permission.
            </div>
          }
        >
          <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
            <For each={devices()}>
              {device => (
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "0.6rem",
                    padding: "0.4rem 0.7rem",
                    background: colors.surface,
                    "border-radius": "6px",
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <Badge
                    variant={
                      device.kind === "audioinput"
                        ? "info"
                        : device.kind === "audiooutput"
                          ? "success"
                          : "warning"
                    }
                  >
                    {device.kind === "audioinput"
                      ? "mic"
                      : device.kind === "audiooutput"
                        ? "speaker"
                        : "camera"}
                  </Badge>
                  <span
                    style={{
                      flex: "1",
                      overflow: "hidden",
                      "text-overflow": "ellipsis",
                      "white-space": "nowrap",
                      "font-size": font.sizeSm,
                      "font-family": font.mono,
                      color: device.label ? colors.secondaryFg : colors.mutedFg,
                      "font-style": device.label ? "normal" : "italic",
                    }}
                  >
                    {device.label || "Permission needed for label"}
                  </span>
                </div>
              )}
            </For>
          </div>
        </Show>
        <StatRow label="total" value={devices().length} />
      </Container>
    );
  },
});

export const FilteredByTypeStory = meta.story({
  name: "Filtered by type",
  parameters: {
    docs: {
      description: {
        story:
          "`createMicrophones()`, `createSpeakers()`, and `createCameras()` are filtered views over `createDevices()`. Each memo uses a custom equality check so downstream computations only re-run when a device of that specific kind changes.",
      },
    },
  },
  render: () => {
    const microphones = createMicrophones();
    const speakers = createSpeakers();
    const cameras = createCameras();

    const sectionLabel = (text: string, count: number) => (
      <div
        style={{
          "font-size": "0.7rem",
          "font-weight": "700",
          color: colors.muted,
          "text-transform": "uppercase",
          "letter-spacing": "0.07em",
          "margin-bottom": "0.25rem",
        }}
      >
        {text} ({count})
      </div>
    );

    const nameList = (items: MediaDeviceInfo[]) => (
      <Show
        when={items.length > 0}
        fallback={
          <span
            style={{
              color: colors.mutedFg,
              "font-size": font.sizeSm,
              "font-style": "italic",
            }}
          >
            none
          </span>
        }
      >
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.15rem" }}>
          <For each={items}>
            {item => (
              <span
                style={{
                  "font-size": font.sizeSm,
                  "font-family": font.mono,
                  color: colors.secondaryFg,
                }}
              >
                {item.label || "Unnamed device"}
              </span>
            )}
          </For>
        </div>
      </Show>
    );

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": font.sizeMd }}>Filtered by device kind</h3>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.75rem" }}>
          <div>
            {sectionLabel("Microphones", microphones().length)}
            {nameList(microphones())}
          </div>
          <div>
            {sectionLabel("Speakers", speakers().length)}
            {nameList(speakers())}
          </div>
          <div>
            {sectionLabel("Cameras", cameras().length)}
            {nameList(cameras())}
          </div>
        </div>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Grant camera or microphone permission to see device labels.
        </p>
      </Container>
    );
  },
});
