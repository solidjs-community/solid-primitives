import { type Component, Suspense, Show, createEffect, onMount } from "solid-js";
import { createGeolocationWatcher } from "../src/index.js";

import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

const Client: Component = () => {
  let ref!: HTMLDivElement;
  let map: L.Map;
  let marker: L.Marker | undefined;

  const { location, error } = createGeolocationWatcher(true, {
    enableHighAccuracy: false,
    maximumAge: 0,
    timeout: Number.POSITIVE_INFINITY,
  });

  onMount(() => {
    map = L.map(ref).setView([37.0643592, -26.1593362], 1);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
  });

  createEffect(() => {
    const coords = location();
    if (map && coords) {
      const latLng: L.LatLngExpression = [coords.latitude, coords.longitude];
      marker?.remove();
      map.setView(latLng, 14);
      marker = L.marker(latLng).addTo(map);
    }
  });

  return (
    <div class="box-border flex h-screen w-full items-center justify-center overflow-hidden bg-gray-900">
      <div class="flex flex-col items-center">
        <div class="flex flex-col items-center justify-center overflow-hidden rounded-lg bg-white/30 p-0 text-white shadow-lg">
          <Show
            fallback={
              <div class="p-4">
                Could not detect coordinates: {error()?.message ?? "unknown error"}
              </div>
            }
            when={!error()}
          >
            <Suspense fallback={<div class="p-4">Acquiring GPS fix...</div>}>
              <div class="flex flex-row">
                <div class="p-4">
                  <b>Accuracy</b>: {(location().accuracy ?? 0).toFixed(2)}
                </div>
                <div class="p-4">
                  <b>Altitude</b>: {(location().altitude ?? 0).toFixed(2)}
                </div>
              </div>
              <div class="p-4">
                {location().latitude}, {location().longitude}
              </div>
            </Suspense>
          </Show>
          <div class="w-100 h-100" ref={el => (ref = el)} />
        </div>
      </div>
    </div>
  );
};

export default Client;
