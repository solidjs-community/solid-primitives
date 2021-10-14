import { createRoot, createSignal } from "solid-js";
import { createEventListener, EventListenerProps } from "../src/index";

describe("createEventListener", () => {
  test('it will add an event', () => new Promise<void>(resolve => createRoot(dispose => {
    const target = new EventTarget();
    const testEvent = new Event('test');
    createEventListener<{ test: Event }>(target, 'test', (ev) => {
      expect(ev).toBe(testEvent);
      dispose();
      resolve();
    });    
    target.dispatchEvent(testEvent);
  })));

  test('it will only add the event once', () => new Promise<void>(resolve => createRoot(dispose => {
    const target = new EventTarget();
    const testEvent = new Event('test');
    let count = 0;
    createEventListener<{ test: Event }>(target, 'test', () => { count++; });    
    target.dispatchEvent(testEvent);
    window.setTimeout(() => {
      expect(count).toBe(1);
      dispose();
      resolve();
    }, 200);
  })));

  test('will add events to multiple targets', () => new Promise<void>(resolve => createRoot(dispose => {
    const targets = [new EventTarget(), new EventTarget()];
    const testEvent = new Event('test');
    let count = 0;
    createEventListener<{test: Event }>(targets, 'test', () => { count++; });
    targets.forEach(target => target.dispatchEvent(testEvent));
    window.setTimeout(() => {
      expect(count).toBe(2);
      dispose();
      resolve()
    }, 200);
  })));

  test('will work as directive and update the event', () => new Promise<void>(resolve => createRoot(dispose => {
    const target = document.createElement('div');
    const testEvent = new Event('load');
    const [props, setProps] = createSignal<EventListenerProps>(['load', (ev: Event) => expect(ev).toBe(testEvent)]);
    createEventListener(target, props);
    target.dispatchEvent(testEvent);
    window.setTimeout(() => {
      setProps(['load', () => (dispose(), resolve())]);
      target.dispatchEvent(testEvent);
    }, 10);
  })));
});
