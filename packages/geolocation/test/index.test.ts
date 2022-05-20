// import { createEffect, createRoot, Resource } from "solid-js";
// import waitForExpect from "wait-for-expect";

// export const mockCoordinates = {
//   latitude: 43.65107,
//   longitude: -79.347015
// };

// describe("createGeolocation", () => {
//   test("test basic geolocation", async () => {
//     const [location] = createRoot(() => createGeolocation());
//     expect(location.loading).toBe(true);
//     await waitForExpect(() => {
//       expect(location.loading).toBe(false);
//     });
//     expect(location()).toEqual(mockCoordinates);
//   });
//   test("test basic geolocation error", async () => {
//     const geoSpy = jest.spyOn(navigator.geolocation, "getCurrentPosition");
//     geoSpy.mockImplementation(
//       jest.fn((_, error) =>
//         error!({ code: 1, message: "GeoLocation error" } as GeolocationPositionError)
//       )
//     );
//     const [location] = createRoot(() => createGeolocation());

//     await waitForResourceLoad(location);

//     // expect(location.loading).toBe(false);
//     expect(location.error).toEqual({
//       code: 1,
//       message: "GeoLocation error"
//     });
//     geoSpy.mockRestore();
//   });
//   test("test geolocation watcher value", async () => {
//     const [location] = createRoot(() => createGeolocationWatcher());
//     await waitForExpect(() => {
//       expect(location()).toEqual(mockCoordinates);
//     });
//   });
// });

// async function waitForResourceLoad(resource: Resource<any>) {
//   await new Promise<void>(resolve => {
//     createRoot(stop => {
//       createEffect(() => {
//         if (!resource.loading) {
//           resolve();
//           stop();
//         }
//       });
//     });
//   });
// }


import { createRoot } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";

import { createGeolocation, createGeolocationWatcher } from "../src/index";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const test = suite("createDebounce");

test("setup and trigger debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const fn = (current: number) => {
      val = current;
    };
    const trigger = createDebounce(fn, 150);
    assert.is(val, 0);
    trigger(5);
    await sleep(300);
    assert.is(val, 5);
    dispose();
  }));

test("trigger multiple debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = createDebounce(current => (val = current), 150);
    assert.is(val, 0);
    trigger(5);
    trigger(1);
    await sleep(300);
    assert.is(val, 1);
    dispose();
  }));

test("test clearing debounce", () =>
  createRoot(async dispose => {
    let val = 0;
    const trigger = createDebounce(current => (val = current), 500);
    assert.is(val, 0);
    trigger(5);
    trigger.clear();
    await sleep(300);
    assert.is(val, 0);
    dispose();
  }));

test.run();
