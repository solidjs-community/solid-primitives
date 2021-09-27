import { createRoot, createEffect, createSignal } from "solid-js";
import { createFullscreen } from "../src";

describe("createFullscreen", () => {
  const ref = document.createElement('div');
  
  test("will call the fullscreen method", () =>
    new Promise<void>(resolve => {
      createRoot(dispose => {
        const active = createFullscreen(ref);
        const expected = [false, true];
        createEffect(() => {
          expect(active()).toBe(expected.shift());
          if (expected.length === 0) {
            dispose();
            resolve();
          }
        })
      });
    }));

  test("will exit fullscreen on reactive change", () =>
    new Promise<void>(resolve => {
      createRoot(dispose => {
        const [fs, setFs] = createSignal(true);
        const active = createFullscreen(ref, fs);
        const expected = [false, true, false];
        createEffect(() => {
          expect(active()).toBe(expected.shift());
          if (expected.length === 2) {
            setTimeout(() => setFs(false), 50);
          } else if (expected.length === 0) {
            dispose();
            resolve();
          }
        })
      });
    }));

  test("will open fullscreen with options", () =>
  new Promise<void>(resolve => {
    createRoot(dispose => {
      const options: FullscreenOptions = { navigationUI: 'hide' };
      const active = createFullscreen(ref, undefined, options);
      const expected = [false, true];
      createEffect(() => {
        expect(active()).toBe(expected.shift());
        if (expected.length === 0) {
          expect((window as any)._fullScreenOptions).toBe(options);
          dispose();
          resolve();
        }
      })
    });
  }))
});
