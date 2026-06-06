import { createSignal, Show } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  createAccelerometer,
  createBattery,
  createCompass,
  createGyroscope,
  makeAccelerometer,
} from "@solid-primitives/sensors";
import readme from "../README.md?raw";
import {
  BoolRow,
  Button,
  colors,
  Container,
  EventLog,
  font,
  Progress,
  StatRow,
} from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Display & Media/Sensors",
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

const fmtSecs = (s: number) => {
  if (!isFinite(s)) return "∞";
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
};

const fmtNum = (n: number | null | undefined, decimals = 3) =>
  n == null ? "—" : n.toFixed(decimals);

export const BatteryStatusStory = meta.story({
  name: "Battery status",
  parameters: {
    docs: {
      description: {
        story:
          "`createBattery()` wraps the Battery Status API (`navigator.getBattery()`). The returned accessor starts as `undefined` until the Promise resolves, then updates reactively on every battery change event. Supported in Chrome/Edge; returns a server-side default on SSR.",
      },
    },
  },
  render: () => {
    const battery = createBattery();

    return (
      <Container width={300}>
        <h3 style={{ margin: 0, "font-size": font.sizeMd }}>Battery status</h3>
        <Show
          when={battery()}
          fallback={
            <div style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>
              Battery API unavailable in this browser.
            </div>
          }
        >
          {b => (
            <>
              <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
                <div style={{ flex: "1" }}>
                  <Progress
                    value={b().level * 100}
                    color={
                      b().charging ? "#10b981" : b().level < 0.2 ? "#ef4444" : colors.primary
                    }
                  />
                </div>
                <span
                  style={{
                    "font-family": font.mono,
                    "font-size": font.sizeBase,
                    "min-width": "2.75rem",
                    color: colors.secondaryFg,
                    "font-weight": "600",
                  }}
                >
                  {Math.round(b().level * 100)}%
                </span>
              </div>
              <BoolRow label="charging" value={b().charging} />
              <StatRow label="full in" value={b().charging ? fmtSecs(b().chargingTime) : "—"} />
              <StatRow
                label="empty in"
                value={!b().charging ? fmtSecs(b().dischargingTime) : "—"}
              />
            </>
          )}
        </Show>
      </Container>
    );
  },
});

export const MotionAndTiltStory = meta.story({
  name: "Motion & tilt",
  parameters: {
    docs: {
      description: {
        story:
          "`createAccelerometer()` and `createGyroscope()` track device motion and orientation via `devicemotion` and `deviceorientation` events, throttled to 100 ms by default. The accelerometer starts as `undefined` until the first event fires. Both update live on a device with motion sensors.",
      },
    },
  },
  render: () => {
    const accel = createAccelerometer();
    const gyro = createGyroscope();

    const panelHeader = (label: string) => (
      <div
        style={{
          "font-size": "0.7rem",
          "font-weight": "700",
          color: colors.muted,
          "text-transform": "uppercase",
          "letter-spacing": "0.06em",
          "margin-bottom": "0.4rem",
        }}
      >
        {label}
      </div>
    );

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": font.sizeMd }}>Motion & orientation</h3>
        <div
          style={{
            display: "grid",
            "grid-template-columns": "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              background: colors.surface,
              "border-radius": "8px",
              border: `1px solid ${colors.border}`,
              padding: "0.75rem",
            }}
          >
            {panelHeader("Accelerometer")}
            <Show
              when={accel() !== undefined}
              fallback={
                <span style={{ color: colors.mutedFg, "font-size": font.sizeSm }}>
                  awaiting…
                </span>
              }
            >
              <div style={{ display: "flex", "flex-direction": "column", gap: "0.2rem" }}>
                <StatRow label="x" value={fmtNum(accel()?.x)} />
                <StatRow label="y" value={fmtNum(accel()?.y)} />
                <StatRow label="z" value={fmtNum(accel()?.z)} />
              </div>
            </Show>
          </div>
          <div
            style={{
              background: colors.surface,
              "border-radius": "8px",
              border: `1px solid ${colors.border}`,
              padding: "0.75rem",
            }}
          >
            {panelHeader("Gyroscope")}
            <div style={{ display: "flex", "flex-direction": "column", gap: "0.2rem" }}>
              <StatRow label="α" value={`${gyro.alpha.toFixed(1)}°`} />
              <StatRow label="β" value={`${gyro.beta.toFixed(1)}°`} />
              <StatRow label="γ" value={`${gyro.gamma.toFixed(1)}°`} />
            </div>
          </div>
        </div>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Requires a device with motion sensors. Use DevTools sensor emulation or test on a
          smartphone.
        </p>
      </Container>
    );
  },
});

export const CompassHeadingStory = meta.story({
  name: "Compass heading",
  parameters: {
    docs: {
      description: {
        story:
          "`createCompass()` wraps the `Magnetometer` Generic Sensor API to read raw magnetic field strength (x, y, z in µT). Available in Chromium-based browsers on devices with a magnetometer. The needle shows an approximate bearing computed from the x/y field components.",
      },
    },
  },
  render: () => {
    const mag = createCompass();
    const bearing = () => ((Math.atan2(mag.y, mag.x) * (180 / Math.PI)) + 360) % 360;

    return (
      <Container width={280}>
        <h3 style={{ margin: 0, "font-size": font.sizeMd }}>Magnetic compass</h3>
        <div style={{ display: "flex", "justify-content": "center", padding: "0.5rem 0" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              border: `3px solid ${colors.border}`,
              "border-radius": "50%",
              position: "relative",
              background: colors.surface,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "3px",
                left: "50%",
                transform: "translateX(-50%)",
                "font-size": "0.6rem",
                color: colors.muted,
                "font-weight": "700",
              }}
            >
              N
            </span>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "3px",
                height: "26px",
                "margin-left": "-1.5px",
                "margin-top": "-26px",
                background: "#ef4444",
                "border-radius": "2px 2px 0 0",
                "transform-origin": "50% 100%",
                transform: `rotate(${bearing()}deg)`,
                transition: "transform 0.12s ease",
              }}
            />
          </div>
        </div>
        <div style={{ display: "flex", "flex-direction": "column", gap: "0.2rem" }}>
          <StatRow label="bearing" value={`${bearing().toFixed(1)}°`} />
          <StatRow label="x (µT)" value={mag.x.toFixed(3)} />
          <StatRow label="y (µT)" value={mag.y.toFixed(3)} />
          <StatRow label="z (µT)" value={mag.z.toFixed(3)} />
        </div>
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Requires Chromium with a physical magnetometer. Returns zeros when unavailable.
        </p>
      </Container>
    );
  },
});

export const NonReactiveListenerStory = meta.story({
  name: "Non-reactive listener",
  parameters: {
    docs: {
      description: {
        story:
          "`makeAccelerometer(onChange, options)` is the non-reactive building block — no Solid owner or `onCleanup` required. It attaches a `devicemotion` listener, throttles calls to the given interval, and returns a cleanup function to remove the listener at any time.",
      },
    },
  },
  render: () => {
    const [log, setLog] = createSignal<{ label: string; time: string }[]>([]);
    const [listening, setListening] = createSignal(false);
    let cleanup: VoidFunction | null = null;

    const start = () => {
      if (cleanup) return;
      cleanup = makeAccelerometer(
        acc => {
          const x = fmtNum(acc?.x, 2);
          const y = fmtNum(acc?.y, 2);
          const z = fmtNum(acc?.z, 2);
          setLog(prev =>
            [
              { label: `x:${x}  y:${y}  z:${z}`, time: new Date().toLocaleTimeString() },
              ...prev,
            ].slice(0, 6),
          );
        },
        { interval: 250 },
      );
      setListening(true);
    };

    const stop = () => {
      cleanup?.();
      cleanup = null;
      setListening(false);
    };

    return (
      <Container width={360}>
        <h3 style={{ margin: 0, "font-size": font.sizeMd }}>makeAccelerometer</h3>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button onClick={start} disabled={listening()} style={{ flex: "1" }}>
            Start
          </Button>
          <Button onClick={stop} disabled={!listening()} variant="outline" style={{ flex: "1" }}>
            Stop
          </Button>
        </div>
        <div
          style={{
            padding: "0.35rem 0.75rem",
            background: listening() ? "#dcfce7" : colors.surface,
            "border-radius": "6px",
            "font-size": font.sizeSm,
            color: listening() ? "#166534" : colors.muted,
            "text-align": "center",
            border: `1px solid ${listening() ? "#bbf7d0" : colors.border}`,
            transition: "background 0.2s, color 0.2s",
          }}
        >
          {listening() ? "Listening for device motion…" : "Not listening"}
        </div>
        <EventLog entries={log()} />
        <p style={{ margin: 0, "font-size": "0.78rem", color: colors.mutedFg }}>
          Attaches a raw <code>devicemotion</code> listener. No Solid owner required — the
          returned function removes the listener at any time.
        </p>
      </Container>
    );
  },
});
