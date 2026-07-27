import "./setup.js";
import { render } from "@solidjs/web";
import { afterEach, describe, expect, test } from "vitest";
import { FaviconLink, makeFavicon } from "../src/index.js";

afterEach(() => {
  document.head.querySelectorAll('link[rel="icon"]').forEach(el => el.remove());
});

describe("FaviconLink", () => {
  test("renders a link[rel=icon] with the given href", () => {
    const container = document.createElement("div");
    const unmount = render(() => <FaviconLink href="/a.png" />, container);

    const link = container.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("/a.png");

    unmount();
  });

  test("supports a custom rel", () => {
    const container = document.createElement("div");
    const unmount = render(
      () => <FaviconLink href="/touch.png" rel="apple-touch-icon" />,
      container,
    );

    expect(container.querySelector('link[rel="apple-touch-icon"]')).not.toBeNull();
    expect(container.querySelector('link[rel="icon"]')).toBeNull();

    unmount();
  });

  test("defaults to rel=icon", () => {
    const container = document.createElement("div");
    const unmount = render(() => <FaviconLink href="/a.png" />, container);

    expect(container.querySelector('link[rel="icon"]')).not.toBeNull();

    unmount();
  });

  // The actual feature this component exists for: rendered into the document's real <head> (the
  // way an SSR framework's document/`<Head>` component would), `makeFavicon`'s "reuse an existing
  // link" lookup finds it and takes over — no coordination beyond both touching the same DOM node.
  test("composes with makeFavicon: an existing FaviconLink is reused, not duplicated", () => {
    const unmountLink = render(() => <FaviconLink href="/initial.png" />, document.head);
    expect(document.head.querySelectorAll('link[rel="icon"]').length).toBe(1);

    const favicon = makeFavicon("/updated.png");
    expect(document.head.querySelectorAll('link[rel="icon"]').length).toBe(1); // reused, not duplicated
    expect(favicon.href).toBe(new URL("/updated.png", location.href).href);

    favicon.dispose();
    // restored to what FaviconLink originally rendered
    const restored = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
    expect(restored?.href).toBe(new URL("/initial.png", location.href).href);

    unmountLink();
  });
});
