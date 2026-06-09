import { For } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { createVideoPlayer } from "@solid-primitives/video";
import {
  Button,
  ButtonRow,
  Container,
  Section,
  BoolRow,
  StatRow,
  Progress,
  colors,
  font,
  radii,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/Video",
  parameters: {
    layout: "centered",
  },
});

export default meta;

const VIDEO = "/video/big_buck_bunny_sall.mp4";

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const SPEEDS = [0.5, 1, 1.5, 2] as const;

export const VolumeAndMuted = meta.story({
  name: "Volume & muted",
  parameters: {
    docs: {
      description: {
        story:
          "`createVideoPlayer` adds reactive `volume` and `muted` signals on top of `createVideo`. The slider and mute toggle update each other independently — muting preserves the volume level.",
      },
    },
  },
  render: () => {
    const video = createVideoPlayer(VIDEO, { preload: "metadata", muted: true });

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            video.player.style.cssText = "width:100%;display:block";
            el.appendChild(video.player);
          }}
        />

        <ButtonRow>
          <Button onClick={() => video.setPlaying(!video.playing())} variant="secondary">
            {video.playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Button
            onClick={() => video.setMuted(!video.muted())}
            variant={video.muted() ? "primary" : "outline"}
          >
            {video.muted() ? "🔇 Muted" : "🔊 Sound"}
          </Button>
        </ButtonRow>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <span
            style={{ "font-size": font.sizeSm, color: colors.muted, "white-space": "nowrap" }}
          >
            Volume
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={video.volume()}
            onInput={e => video.setVolume(Number(e.currentTarget.value))}
            disabled={video.muted()}
            style={{ flex: "1" }}
          />
          <span
            style={{ "font-size": font.sizeSm, "font-family": font.mono, "white-space": "nowrap" }}
          >
            {(video.volume() * 100).toFixed(0)}%
          </span>
        </div>

        <Section title="State">
          <BoolRow label="muted" value={video.muted()} />
          <StatRow label="volume" value={video.volume().toFixed(2)} />
        </Section>
      </Container>
    );
  },
});

export const SpeedAndLoop = meta.story({
  name: "Speed & loop",
  parameters: {
    docs: {
      description: {
        story:
          "`playbackRate` and `loop` are reactive signals on `createVideoPlayer`. Selecting a speed or toggling loop reflects back to the video element immediately.",
      },
    },
  },
  render: () => {
    const video = createVideoPlayer(VIDEO, { preload: "metadata", muted: true });

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            video.player.style.cssText = "width:100%;display:block";
            el.appendChild(video.player);
          }}
        />

        <ButtonRow>
          <Button onClick={() => video.setPlaying(!video.playing())} variant="secondary">
            {video.playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Button
            onClick={() => video.setLoop(!video.loop())}
            variant={video.loop() ? "primary" : "outline"}
          >
            ↺ Loop
          </Button>
        </ButtonRow>

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>Speed</span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <For each={SPEEDS}>
              {s => (
                <Button
                  onClick={() => video.setPlaybackRate(s)}
                  variant={video.playbackRate() === s ? "primary" : "outline"}
                  style={{ padding: "0.35rem 0.65rem" }}
                >
                  {s}×
                </Button>
              )}
            </For>
          </div>
        </div>

        <Section title="State">
          <StatRow label="playbackRate" value={`${video.playbackRate()}×`} />
          <BoolRow label="loop" value={video.loop()} />
        </Section>
      </Container>
    );
  },
});

const READY_STATE = ["NOTHING", "METADATA", "CURRENT", "FUTURE", "ENOUGH"] as const;

export const BufferAndDimensions = meta.story({
  name: "Buffer & dimensions",
  parameters: {
    docs: {
      description: {
        story:
          "`createVideoPlayer` exposes `readyState`, `buffered`, and intrinsic `videoWidth`/`videoHeight`. Hit play to start buffering — `readyState` increments as data arrives.",
      },
    },
  },
  render: () => {
    const video = createVideoPlayer(VIDEO, { preload: "auto", muted: true });

    const bufferedPct = () => {
      const b = video.buffered();
      const d = video.player.duration;
      if (!b || b.length === 0 || !d || !isFinite(d)) return 0;
      return (b.end(b.length - 1) / d) * 100;
    };

    const bufferedLabel = () => {
      const b = video.buffered();
      if (!b || b.length === 0) return "none";
      return `${b.start(0).toFixed(1)}–${b.end(b.length - 1).toFixed(1)}s`;
    };

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            video.player.style.cssText = "width:100%;display:block";
            el.appendChild(video.player);
          }}
        />

        <ButtonRow>
          <Button onClick={() => video.setPlaying(!video.playing())} variant="secondary">
            {video.playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
        </ButtonRow>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.3rem" }}>
          <span style={{ "font-size": font.sizeSm, color: colors.muted }}>Buffered</span>
          <Progress value={bufferedPct()} color={colors.primary} />
          <span style={{ "font-size": font.sizeSm, "font-family": font.mono, color: colors.muted }}>
            {bufferedLabel()}
          </span>
        </div>

        <Section title="State">
          <StatRow
            label="readyState"
            value={`${video.readyState()} — ${READY_STATE[video.readyState()] ?? "?"}`}
          />
          <StatRow
            label="dimensions"
            value={video.videoWidth() > 0 ? `${video.videoWidth()} × ${video.videoHeight()}` : "—"}
          />
        </Section>
      </Container>
    );
  },
});
