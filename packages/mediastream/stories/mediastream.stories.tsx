import { createEffect, createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createAmplitudeFromStream,
  createAmplitudeStream,
  createMediaPermissionRequest,
  createScreen,
  createStream,
} from "../src/index.js";
import readme from "../README.md?raw";
import {
  Alert,
  BoolRow,
  Button,
  ButtonRow,
  Container,
  ProgressBar,
  StatRow,
} from "../../../.storybook/ui/index.js";
import { colors, font, radii } from "../../../.storybook/ui/tokens.js";

const meta = preview.meta({
  title: "Browser APIs/MediaStream",
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

export const CameraPreview = meta.story({
  name: "Camera preview",
  parameters: {
    docs: {
      description: {
        story:
          "`createStream` returns a reactive stream accessor and `{ stop, mute }` controls. The stream is only requested when a non-falsy source is provided — toggling the source accessor drives the lifecycle.",
      },
    },
  },
  render: () => {
    const [constraints, setConstraints] = createSignal<MediaStreamConstraints>();
    const [stream, { stop, mute }] = createStream(constraints);
    const [muted, setMuted] = createSignal(false);

    const handleMute = () => {
      const next = !muted();
      setMuted(next);
      mute(next);
    };

    const handleStop = () => {
      stop();
      setConstraints(undefined);
      setMuted(false);
    };

    return (
      <Container width={320}>
        <ButtonRow>
          <Button
            variant="primary"
            disabled={!!constraints()}
            onClick={() => setConstraints({ video: true })}
          >
            Start
          </Button>
          <Show when={stream()}>
            <Button variant="outline" onClick={handleMute}>
              {muted() ? "Unmute" : "Mute"}
            </Button>
            <Button variant="outline" onClick={handleStop}>
              Stop
            </Button>
          </Show>
        </ButtonRow>
        <BoolRow label="stream active" value={!!stream()} />
        <BoolRow label="muted" value={muted()} />
        <Show when={constraints() && !stream()}>
          <span style={{ color: colors.muted, "font-size": font.sizeSm }}>
            Requesting camera access…
          </span>
        </Show>
        <Show when={stream()}>
          <video
            ref={el => {
              el.muted = true;
              createEffect(stream, s => {
                el.srcObject = s ?? null;
              });
            }}
            autoplay
            playsinline
            style={{
              width: "100%",
              "border-radius": radii.lg,
              background: "#000",
              "aspect-ratio": "4 / 3",
              "object-fit": "cover",
            }}
          />
        </Show>
      </Container>
    );
  },
});

export const MicLevel = meta.story({
  name: "Mic level meter",
  parameters: {
    docs: {
      description: {
        story:
          "`createAmplitudeStream` combines a microphone stream with a Web Audio analyser, sampling RMS amplitude (0–100) every animation frame. AudioContext resume requires a prior user gesture in most browsers.",
      },
    },
  },
  render: () => {
    const [constraints, setConstraints] = createSignal<MediaStreamConstraints>();
    const [amplitude, { stream, stop }] = createAmplitudeStream(constraints);

    const handleStop = () => {
      stop();
      setConstraints(undefined);
    };

    return (
      <Container width={320}>
        <ButtonRow>
          <Button
            variant="primary"
            disabled={!!constraints()}
            onClick={() => setConstraints({ audio: true })}
          >
            Start mic
          </Button>
          <Show when={constraints()}>
            <Button variant="outline" onClick={handleStop}>
              Stop
            </Button>
          </Show>
        </ButtonRow>
        <BoolRow label="stream active" value={!!stream()} />
        <Show when={constraints() && !stream()}>
          <span style={{ color: colors.muted, "font-size": font.sizeSm }}>
            Requesting microphone access…
          </span>
        </Show>
        <Show when={stream()}>
          <ProgressBar
            value={amplitude()}
            min={0}
            max={100}
            label="Amplitude"
            color={amplitude() > 70 ? colors.warning : colors.primary}
          />
          <StatRow label="level" value={amplitude()} />
        </Show>
      </Container>
    );
  },
});

export const AmplitudeFromStream = meta.story({
  name: "Amplitude from stream",
  parameters: {
    docs: {
      description: {
        story:
          "`createAmplitudeFromStream` attaches a Web Audio analyser to any existing stream accessor. Here a combined camera+mic stream powers both a live video preview and an amplitude meter — showing how the two primitives compose independently.",
      },
    },
  },
  render: () => {
    const [constraints, setConstraints] = createSignal<MediaStreamConstraints>();
    const [stream, { stop: stopStream }] = createStream(constraints);
    const [amplitude] = createAmplitudeFromStream(stream);

    const handleStop = () => {
      stopStream();
      setConstraints(undefined);
    };

    return (
      <Container width={320}>
        <ButtonRow>
          <Button
            variant="primary"
            disabled={!!constraints()}
            onClick={() => setConstraints({ video: true, audio: true })}
          >
            Start camera + mic
          </Button>
          <Show when={stream()}>
            <Button variant="outline" onClick={handleStop}>
              Stop
            </Button>
          </Show>
        </ButtonRow>
        <Show when={constraints() && !stream()}>
          <span style={{ color: colors.muted, "font-size": font.sizeSm }}>Requesting access…</span>
        </Show>
        <Show when={stream()}>
          <video
            ref={el => {
              el.muted = true;
              createEffect(stream, s => {
                el.srcObject = s ?? null;
              });
            }}
            autoplay
            playsinline
            style={{
              width: "100%",
              "border-radius": radii.lg,
              background: "#000",
              "aspect-ratio": "4 / 3",
              "object-fit": "cover",
            }}
          />
          <ProgressBar
            value={amplitude()}
            min={0}
            max={100}
            label="Mic amplitude"
            color={amplitude() > 70 ? colors.warning : colors.primary}
          />
        </Show>
      </Container>
    );
  },
});

export const ScreenCapture = meta.story({
  name: "Screen capture",
  parameters: {
    docs: {
      description: {
        story:
          "`createScreen` calls `getDisplayMedia` to share a screen, window, or browser tab. The browser shows its own picker UI — must be triggered by a direct user gesture. May not work inside a sandboxed iframe.",
      },
    },
  },
  render: () => {
    const [constraints, setConstraints] = createSignal<DisplayMediaStreamConstraints>();
    const [screen, { stop }] = createScreen(constraints);

    const handleStop = () => {
      stop();
      setConstraints(undefined);
    };

    return (
      <Container width={360}>
        <ButtonRow>
          <Button variant="primary" onClick={() => setConstraints({ video: true })}>
            {screen() ? "Change source" : "Capture screen"}
          </Button>
          <Show when={screen()}>
            <Button variant="outline" onClick={handleStop}>
              Stop
            </Button>
          </Show>
        </ButtonRow>
        <BoolRow label="stream active" value={!!screen()} />
        <Show when={screen()}>
          <video
            ref={el => {
              el.muted = true;
              createEffect(screen, s => {
                el.srcObject = s ?? null;
              });
            }}
            autoplay
            playsinline
            style={{
              width: "100%",
              "border-radius": radii.lg,
              background: "#000",
              "aspect-ratio": "16 / 9",
              "object-fit": "contain",
            }}
          />
        </Show>
      </Container>
    );
  },
});

export const PermissionPrompt = meta.story({
  name: "Permission prompt",
  parameters: {
    docs: {
      description: {
        story:
          "`createMediaPermissionRequest` briefly opens a stream to trigger the browser permission dialog, then immediately closes it. Returns a `Promise<void>` that resolves on grant and rejects on denial.",
      },
    },
  },
  render: () => {
    const [status, setStatus] = createSignal<"idle" | "pending" | "granted" | "denied">("idle");

    const request = (source?: MediaStreamConstraints | "audio" | "video") => {
      setStatus("pending");
      createMediaPermissionRequest(source).then(
        () => setStatus("granted"),
        () => setStatus("denied"),
      );
    };

    return (
      <Container width={320}>
        <ButtonRow>
          <Button
            variant="outline"
            disabled={status() === "pending"}
            onClick={() => request("audio")}
          >
            Audio
          </Button>
          <Button
            variant="outline"
            disabled={status() === "pending"}
            onClick={() => request("video")}
          >
            Video
          </Button>
          <Button variant="outline" disabled={status() === "pending"} onClick={() => request()}>
            Both
          </Button>
        </ButtonRow>
        <StatRow label="status" value={status()} />
        <Show when={status() === "denied"}>
          <Alert variant="error">
            Permission denied — reset in browser site settings to try again.
          </Alert>
        </Show>
        <Show when={status() === "granted"}>
          <Alert variant="info">
            Permission granted. Use createStream or createScreen to open the stream.
          </Alert>
        </Show>
      </Container>
    );
  },
});
