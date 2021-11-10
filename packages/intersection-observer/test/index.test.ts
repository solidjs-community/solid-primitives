import { createRoot } from 'solid-js';
import { suite } from 'uvu';
import * as assert from 'uvu/assert';

import { createIntersectionObserver } from '../src/';

const intersectionObserverInstances = [];

class IntersectionObserver {
  public onChange: IntersectionObserverCallback;
  public options: IntersectionObserverInit;
  public elements: HTMLElement[] = [];
  readonly root = document;
  readonly rootMargin = "0";
  readonly thresholds = [0];
  constructor(onChange: IntersectionObserverCallback, options: IntersectionObserverInit) {
    this.onChange = onChange;
    this.options = options;
    intersectionObserverInstances.push(this);
  }
  disconnect() { this.elements = []; }
  observe(el: HTMLElement) { this.elements.push(el); }
  unobserve(el: HTMLElement) {
    for (let index; (index = this.elements.indexOf(el)) !== -1;) {
      this.elements.splice(index, 1);
    }
  }
  takeRecords() { return []; }
}
global.IntersectionObserver = IntersectionObserver

const runOnChangeOnLastObserver = (payload) =>
  intersectionObserverInstances[intersectionObserverInstances.length - 1]
    .onChange(payload);

const cio = suite('createIntersectionObserver');

cio.before(context => {
  context.div = document.createElement('div');
});

cio('creates a new IntersectionObserver instance', ({ div }) => {
  const previousInstanceCount = intersectionObserverInstances.length;
  createRoot(dispose => {
    createIntersectionObserver(div, console.log);
    dispose();
  });
  const newInstanceCount = intersectionObserverInstances.length;
  assert.is(previousInstanceCount + 1, newInstanceCount, 'new instance was not created');
});

cio.run();

const cvo = suite('createViewportObserver');

cvo.before(context => {
  context.elements = [document.createElement('div'), document.createElement('span')];
});

cvo.run();
