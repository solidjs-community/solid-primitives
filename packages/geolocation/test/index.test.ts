import { createRoot } from "solid-js";
import { createGeolocation } from "../src/index";

describe("createGeolocation", (): void => {
  createRoot(dispose => {
    const [ location ] = createGeolocation();
    expect(location()).toBe({
      coords: {
        latitude: 10,
        longitude: 10
      }
    });
    dispose();
  });
});
