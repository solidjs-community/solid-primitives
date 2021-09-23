import { createRoot } from 'solid-js';
import { render } from 'solid-testing-library';
import { createCookieStore } from '../src';

describe('createCookieStore', () => {
  const KEY = 'key';
  const PREFIX = 'prefix';
  const VALUE = {
    INITIAL: 'initial value',
    CHANGED: 'changed value',
    WITH_EQUALS: 'with equal (=) sign',
    NONE: '',
  };

  it('works without prefix', () => createRoot((dispose) => {
    document.cookie = `${KEY}=${VALUE.INITIAL};`
    const [store] = createCookieStore<{ key: string }>();
    expect(store.key).toEqual(VALUE.INITIAL);
    dispose();
  }));

  it('uses prefix', () => createRoot((dispose) => {
    document.cookie = `${PREFIX}.${KEY}=${VALUE.INITIAL};`
    const [store] = createCookieStore<{ key: string }>(PREFIX);
    expect(store.key).toEqual(VALUE.INITIAL);
    dispose();
  }));

  it('returns "" for unset values', () => createRoot((dispose) => {
    document.cookie = `${PREFIX}.${KEY}=${VALUE.INITIAL};`
    const [store] = createCookieStore<{ [key: string]: string }>();
    expect(store.none).toEqual(VALUE.NONE);
    dispose();
  }));

  it('updates values via `setValue(key, value)', () => createRoot((dispose) => {
    document.cookie = '';
    const [store, setValue] = createCookieStore<{ key: string }>();
    setValue(KEY, VALUE.CHANGED);
    expect(document.cookie).toMatch(`${KEY}=${escape(VALUE.CHANGED)}`);
    dispose();
  }));

  it('toJSON will return all cookies and handle values with "=" correctly', () => createRoot((dispose) => {
    document.cookie = `${KEY}=${VALUE.WITH_EQUALS};`
    const [store] = createCookieStore<{ key: string, toJSON: () => ({ key: string }) }>();
    expect(store.toJSON()).toMatchObject({ key: VALUE.WITH_EQUALS });
    dispose();
  }));
});
