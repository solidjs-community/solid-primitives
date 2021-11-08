import { createEffect, createRoot } from 'solid-js';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import createScrollObserver from "../src/index";

const test = suite("createScrollObserver");

test('will observe scroll events', async () => {
  const expected = [0, 100, 42];
  const actual = [];

  const div = document.createElement('div');
  Object.assign(div, { pageYOffset: 0 });

  await new Promise<void>(resolve => createRoot(dispose => {
    const top = createScrollObserver(() => div);
    createEffect(() => {
      actual.push(top());
      Object.assign(div, { pageYOffset: expected[actual.length] });
      div.dispatchEvent(new Event('scroll'));
      if (actual.length === expected.length) { 
        dispose();
        resolve();
      }
    });
  }));

  assert.equal(actual, expected);
});

test.run();
