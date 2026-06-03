import { createMemo, createSignal, For, Show, Switch, Match } from "solid-js";
import preview from "../../../.storybook/preview.js";
import {
  makeGeolocation,
  createGeolocationWatcher,
  createDistance,
} from "@solid-primitives/geolocation";
import readme from "../README.md?raw";
import { Stat, Button, Container } from "../../../.storybook/ui/index.js";

const meta = preview.meta({
  title: "Browser APIs/Geolocation",
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

export const OneShot = meta.story({
  name: "makeGeolocation — one-shot query",
  parameters: {
    docs: {
      description: {
        story:
          "`makeGeolocation()` returns a `[query, cleanup]` tuple. Call `query()` to fire a one-shot `getCurrentPosition` request — it returns a `Promise<GeolocationCoordinates>`. No Solid owner required; cleanup is manual. The browser will prompt for location permission on first use.",
      },
    },
  },
  render: () => {
    type Status = "idle" | "loading" | "success" | "error";
    const [status, setStatus] = createSignal<Status>("idle");
    const [coords, setCoords] = createSignal<GeolocationCoordinates | null>(null);
    const [errMsg, setErrMsg] = createSignal("");

    const handleQuery = async () => {
      setStatus("loading");
      setCoords(null);
      setErrMsg("");
      const [query, cleanup] = makeGeolocation({ enableHighAccuracy: true, timeout: 10_000 });
      try {
        setCoords(await query());
        setStatus("success");
      } catch (e) {
        setErrMsg((e as Error).message);
        setStatus("error");
      } finally {
        cleanup();
      }
    };

    return (
      <Container>
        <h3 style={{ margin: 0 }}>makeGeolocation</h3>

        <Button onClick={handleQuery} disabled={status() === "loading"}>
          {status() === "loading" ? "Querying…" : "Get my location"}
        </Button>

        <Show when={status() === "success"}>
          <div>
            <Stat label="Latitude">{coords()!.latitude.toFixed(6)}°</Stat>
            <Stat label="Longitude">{coords()!.longitude.toFixed(6)}°</Stat>
            <Stat label="Accuracy">{coords()!.accuracy.toFixed(0)} m</Stat>
            <Show when={coords()!.altitude !== null}>
              <Stat label="Altitude">{coords()!.altitude!.toFixed(1)} m</Stat>
            </Show>
          </div>
        </Show>

        <Show when={status() === "error"}>
          <span style={{ color: "#ef4444", "font-size": "0.9rem" }}>✗ {errMsg()}</span>
        </Show>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Non-reactive — no Solid owner required. Call <code>cleanup()</code> to cancel a
          pending request.
        </p>
      </Container>
    );
  },
});

export const WatcherStory = meta.story({
  name: "createGeolocationWatcher — live tracking",
  parameters: {
    docs: {
      description: {
        story:
          "`createGeolocationWatcher(enabled)` starts a `watchPosition` call that feeds a reactive `location` signal. Toggle `enabled` to start and stop the watcher. `location()` throws `NotReadyError` until the first GPS fix — use a `Loading` boundary or a try-catch memo to handle the pending state without suspending the whole component.",
      },
    },
  },
  render: () => {
    const [enabled, setEnabled] = createSignal(false);
    const { location, error } = createGeolocationWatcher(enabled, { timeout: 15_000 });

    const coords = createMemo(() => {
      try {
        return location();
      } catch {
        return null;
      }
    });

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createGeolocationWatcher</h3>

        <Button
          onClick={() => setEnabled(e => !e)}
          variant={enabled() ? "outline" : "primary"}
        >
          {enabled() ? "Stop watching" : "Start watching"}
        </Button>

        <Show when={enabled()}>
          <Switch>
            <Match when={error()}>
              <span style={{ color: "#ef4444", "font-size": "0.9rem" }}>
                ✗ {error()!.message}
              </span>
            </Match>
            <Match when={coords()}>
              {c => (
                <div>
                  <Stat label="Latitude">{c().latitude.toFixed(6)}°</Stat>
                  <Stat label="Longitude">{c().longitude.toFixed(6)}°</Stat>
                  <Stat label="Accuracy">{c().accuracy.toFixed(0)} m</Stat>
                  <Show when={c().speed !== null}>
                    <Stat label="Speed">{c().speed!.toFixed(1)} m/s</Stat>
                  </Show>
                </div>
              )}
            </Match>
            <Match when={true}>
              <em style={{ color: "#94a3b8", "font-size": "0.9rem" }}>
                Acquiring GPS fix…
              </em>
            </Match>
          </Switch>
        </Show>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          The watcher starts and stops reactively based on <code>enabled</code>. Reactive{" "}
          <code>options</code> would restart the watcher automatically.
        </p>
      </Container>
    );
  },
});

const LANDMARKS = {
  "Eiffel Tower, Paris": { latitude: 48.8584, longitude: 2.2945 },
  "Statue of Liberty, NY": { latitude: 40.6892, longitude: -74.0445 },
  "Big Ben, London": { latitude: 51.5007, longitude: -0.1246 },
  "Sydney Opera House": { latitude: -33.8568, longitude: 151.2153 },
  "Mount Fuji, Japan": { latitude: 35.3606, longitude: 138.7274 },
  "Colosseum, Rome": { latitude: 41.8902, longitude: 12.4922 },
} as const;

export const DistanceTracking = meta.story({
  name: "createDistance — distance to landmark",
  parameters: {
    docs: {
      description: {
        story:
          "`createDistance(target)` uses `createGeolocationWatcher` internally and returns `null` until the first GPS fix — no `Loading` boundary needed. The target can be a reactive accessor; changing it recalculates the distance without restarting the GPS watcher.",
      },
    },
  },
  render: () => {
    const [enabled, setEnabled] = createSignal(false);
    const [landmark, setLandmark] = createSignal<keyof typeof LANDMARKS>("Eiffel Tower, Paris");

    const distanceKm = createDistance(() => LANDMARKS[landmark()], {
      unit: "km",
      enabled,
      watcherOptions: { timeout: 15_000 },
    });

    const distanceM = createDistance(() => LANDMARKS[landmark()], {
      unit: "m",
      enabled,
      watcherOptions: { timeout: 15_000 },
    });

    return (
      <Container>
        <h3 style={{ margin: 0 }}>createDistance</h3>

        <div style={{ display: "flex", "flex-direction": "column", gap: "0.35rem" }}>
          <label style={{ "font-size": "0.85rem", color: "#64748b" }}>Target landmark</label>
          <select
            value={landmark()}
            onChange={e => setLandmark(e.currentTarget.value as keyof typeof LANDMARKS)}
            style={{
              padding: "0.4rem 0.75rem",
              "font-size": "0.9rem",
              "border-radius": "6px",
              border: "1px solid #e2e8f0",
            }}
          >
            <For each={Object.keys(LANDMARKS) as (keyof typeof LANDMARKS)[]}>
              {name => <option value={name}>{name}</option>}
            </For>
          </select>
        </div>

        <Button
          onClick={() => setEnabled(e => !e)}
          variant={enabled() ? "outline" : "primary"}
        >
          {enabled() ? "Stop tracking" : "Start tracking"}
        </Button>

        <Show when={enabled()}>
          <div>
            <Stat label="Distance (km)">
              {distanceKm() !== null ? distanceKm()!.toFixed(2) : "Acquiring fix…"}
            </Stat>
            <Stat label="Distance (m)">
              {distanceM() !== null ? distanceM()!.toFixed(0) : "Acquiring fix…"}
            </Stat>
            <Stat label="Target lat">{LANDMARKS[landmark()].latitude.toFixed(4)}°</Stat>
            <Stat label="Target lng">{LANDMARKS[landmark()].longitude.toFixed(4)}°</Stat>
          </div>
        </Show>

        <p style={{ "font-size": "0.8rem", color: "#64748b", margin: 0 }}>
          Swap the landmark while tracking — distance recalculates immediately using the
          Haversine formula without restarting the GPS watcher.
        </p>
      </Container>
    );
  },
});
