import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makeVideoPlayer } from "@solid-primitives/video";
import {
  Button,
  Container,
  Section,
  BoolRow,
  StatRow,
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

export const ImperativeControls = meta.story({
  name: "Imperative controls",
  parameters: {
    docs: {
      description: {
        story:
          "`makeVideoPlayer` is non-reactive — it returns a plain controls object with no Solid owner required. Wire event handlers to pull state into signals only when needed.",
      },
    },
  },
  render: () => {
    const [playing, setPlaying] = createSignal(false);
    const [currentTime, setCurrentTime] = createSignal(0);
    const [duration, setDuration] = createSignal(0);

    const [controls] = makeVideoPlayer(
      VIDEO,
      {
        playing: () => setPlaying(true),
        pause: () => setPlaying(false),
        ended: () => setPlaying(false),
        timeupdate: () => setCurrentTime(controls.player.currentTime),
        loadeddata: () => setDuration(controls.player.duration),
      },
      { preload: "metadata", muted: true },
    );

    return (
      <Container width={320}>
        <div
          style={{ "border-radius": radii.lg, overflow: "hidden", background: "#000" }}
          ref={el => {
            controls.player.style.cssText = "width:100%;display:block";
            el.appendChild(controls.player);
          }}
        />

        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <Button
            onClick={() => (playing() ? controls.pause() : controls.play())}
            variant="secondary"
          >
            {playing() ? "⏸ Pause" : "▶ Play"}
          </Button>

          <Show
            when={duration() > 0}
            fallback={
              <span style={{ color: colors.muted, "font-size": font.sizeSm }}>Loading…</span>
            }
          >
            <input
              type="range"
              min="0"
              max={duration()}
              value={currentTime()}
              onInput={e => controls.seek(Number(e.currentTarget.value))}
              style={{ flex: "1", "min-width": "0" }}
            />
            <span
              style={{
                "font-size": font.sizeSm,
                "font-family": font.mono,
                "white-space": "nowrap",
              }}
            >
              {fmt(currentTime())} / {fmt(duration())}
            </span>
          </Show>
        </div>

        <Section title="State">
          <BoolRow label="playing" value={playing()} />
          <StatRow label="currentTime" value={fmt(currentTime())} />
        </Section>
      </Container>
    );
  },
});
