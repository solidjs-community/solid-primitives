import { createRoot } from "solid-js";
import { createGeolocation } from "../src/index";
import waitForExpect from 'wait-for-expect';

describe("createGeolocation", () => {
  test("test basic geolocation", async () => {
    const [ location ] = createRoot(() => createGeolocation());
    expect(location.loading).toBe(true);
    await waitForExpect(() => {
      expect(location.loading).toBe(false);
    });
    expect(location()).toEqual({
      latitude: 43.651070,
      longitude: -79.3470150
    });
  });
  test("test basic geolocation error", async () => {
    navigator.geolocation.errorMode(true);
    const [ location ] = createRoot(() => createGeolocation());
    expect(location.loading).toBe(true);
    await waitForExpect(() => {
      expect(location.loading).toBe(false);
    });
    expect(location.error).toEqual({
      code: 1,
      message: 'GeoLocation Error'
    });
  });
});
