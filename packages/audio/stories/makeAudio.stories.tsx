import { createSignal } from "solid-js";
import preview from "../../../.storybook/preview.js";
import { makeAudio } from "@solid-primitives/audio";
import { VolumeSlider } from "./_helpers.js";
import { Button } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/Audio",
  parameters: {
    layout: "centered",
  },
});

export default meta;

export const NonReactive = meta.story({
  name: "Non-reactive",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAudio` creates a raw `HTMLAudioElement` with event handlers attached. No Solid owner required — you manage lifecycle yourself via the returned `cleanup` function.",
      },
    },
  },
  render: () => {
    const [playing, setPlaying] = createSignal(false);
    const [volume, setVol] = createSignal(1);

    const [player, cleanup] = makeAudio("/audio/sample1.mp3", {
      playing: () => setPlaying(true),
      pause: () => setPlaying(false),
      ended: () => setPlaying(false),
      volumechange: () => setVol(player.volume),
    });

    return (
      <div style={{ "font-family": "system-ui", padding: "1.5rem", "min-width": "280px" }}>
        <h3 style={{ margin: "0 0 1rem" }}>makeAudio</h3>
        <p style={{ "font-size": "0.85rem", color: "#64748b", margin: "0 0 1rem" }}>
          Direct <code>HTMLAudioElement</code> — no reactive signals.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", "align-items": "center", "margin-bottom": "0.75rem" }}>
          <Button
            onClick={() => (playing() ? player.pause() : player.play())}
            variant="secondary"
          >
            {playing() ? "⏸ Pause" : "▶ Play"}
          </Button>
          <Button onClick={cleanup} variant="outline">■ Cleanup</Button>
        </div>

        <VolumeSlider value={volume} onChange={v => { player.volume = v; }} />
      </div>
    );
  },
});
