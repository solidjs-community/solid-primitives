export const SAMPLES = [
  { label: "Sample 1", url: "/audio/sample1.mp3" },
  { label: "Sample 2", url: "/audio/sample2.mp3" },
  { label: "Sample 3", url: "/audio/sample3.mp3" },
] as const;

export const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const VolumeSlider = (props: { value: () => number; onChange: (v: number) => void }) => (
  <label style={{ display: "flex", "align-items": "center", gap: "0.5rem", "font-size": "0.85rem" }}>
    Vol
    <input
      type="range"
      min="0"
      max="1"
      step="0.05"
      value={props.value()}
      onInput={e => props.onChange(+e.currentTarget.value)}
      style={{ width: "80px" }}
    />
    <span>{Math.round(props.value() * 100)}%</span>
  </label>
);

export const SeekSlider = (props: {
  current: () => number;
  max: number;
  onSeek: (t: number) => void;
}) => (
  <input
    type="range"
    min="0"
    max={props.max}
    step="0.5"
    value={props.current()}
    onInput={e => props.onSeek(+e.currentTarget.value)}
    style={{ width: "180px" }}
  />
);
