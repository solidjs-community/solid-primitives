import { createRoot } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createShortcut, makeShortcutRegistry } from "../src/index.js";

type Win = Window & typeof globalThis;

const fire = (
  target: EventTarget,
  key: string,
  type: "keydown" | "keyup" = "keydown",
  EventCtor: typeof Event = Event,
) => {
  const ev = new EventCtor(type, { cancelable: true, bubbles: true, composed: true }) as any;
  ev.key = key;
  target.dispatchEvent(ev);
  return ev as KeyboardEvent;
};

afterEach(() => {
  window.dispatchEvent(new Event("blur"));
  document.body.innerHTML = "";
});

/** input types that never accept typed characters: plain-key shortcuts must still fire */
const EXEMPT = ["checkbox", "button", "submit", "reset", "image"];
/** input types that consume typed characters or keys (arrows, typeahead): stay ignored */
const EDITABLE = [
  "text",
  "search",
  "email",
  "url",
  "tel",
  "password",
  "number",
  "date",
  "time",
  "datetime-local",
  "month",
  "week",
  "radio",
  "range",
  "file",
  "color",
];

const makeInput = (doc: Document, type?: string) => {
  const input = doc.createElement("input");
  if (type !== undefined) input.setAttribute("type", type);
  return input;
};

/** Runs one keystroke through createShortcut(ignoreWithinInputs) and a registry(ignoreInputs). */
const probe = (target: EventTarget, EventCtor: typeof Event = Event, scope?: EventTarget) => {
  const cs = vi.fn();
  const reg = vi.fn();
  let registry!: ReturnType<typeof makeShortcutRegistry>;
  createRoot(dispose => {
    createShortcut(["S"], cs, { ignoreWithinInputs: true });
    registry = makeShortcutRegistry(scope ? { scope } : undefined);
    registry.register({ keys: "S", ignoreInputs: true, handler: reg });
    fire(target, "s", "keydown", EventCtor);
    fire(target, "s", "keyup", EventCtor);
    registry.clear();
    dispose();
  });
  return { cs: cs.mock.calls.length, reg: reg.mock.calls.length };
};

describe("input types that cannot receive typed characters", () => {
  test.each(EXEMPT)("type=%s: ignoreWithinInputs and ignoreInputs do not suppress", type => {
    const input = makeInput(document, type);
    document.body.append(input);
    expect(probe(input)).toEqual({ cs: 1, reg: 1 });
  });

  test.each(EXEMPT)("type=%s: case-insensitive (uppercase attribute)", type => {
    const input = makeInput(document, type.toUpperCase());
    document.body.append(input);
    expect(probe(input)).toEqual({ cs: 1, reg: 1 });
  });

  test("mixed-case type attribute values", () => {
    for (const type of ["CheckBox", "SuBmIt", "BUTTON", "Reset", "ImAgE"]) {
      const input = makeInput(document, type);
      document.body.append(input);
      expect(probe(input)).toEqual({ cs: 1, reg: 1 });
      input.remove();
    }
    const text = makeInput(document, "TeXt");
    document.body.append(text);
    expect(probe(text)).toEqual({ cs: 0, reg: 0 });
  });

  test("falls back to getAttribute when the type property is not a string", () => {
    const input = makeInput(document, "checkbox");
    Object.defineProperty(input, "type", { value: undefined });
    document.body.append(input);
    expect(probe(input)).toEqual({ cs: 1, reg: 1 });
  });
});

describe("input types that stay editable", () => {
  test.each(EDITABLE)("type=%s: still ignored", type => {
    const input = makeInput(document, type);
    document.body.append(input);
    expect(probe(input)).toEqual({ cs: 0, reg: 0 });
  });

  test.each(EDITABLE)("type=%s: still ignored (uppercase attribute)", type => {
    const input = makeInput(document, type.toUpperCase());
    document.body.append(input);
    expect(probe(input)).toEqual({ cs: 0, reg: 0 });
  });

  test("input with no type attribute is a text input", () => {
    const input = makeInput(document);
    document.body.append(input);
    expect(probe(input)).toEqual({ cs: 0, reg: 0 });
  });

  test("input with an unknown or empty type is a text input", () => {
    for (const type of ["bogus", ""]) {
      const input = makeInput(document, type);
      document.body.append(input);
      expect(probe(input)).toEqual({ cs: 0, reg: 0 });
      input.remove();
    }
  });

  test("textarea, select and contenteditable are still ignored", () => {
    const textarea = document.createElement("textarea");
    const select = document.createElement("select");
    const editable = document.createElement("div");
    Object.defineProperty(editable, "isContentEditable", { value: true });
    document.body.append(textarea, select, editable);
    for (const el of [textarea, select, editable]) expect(probe(el)).toEqual({ cs: 0, reg: 0 });
  });
});

describe("input types inside open shadow roots", () => {
  const shadowInput = (type?: string) => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = host.attachShadow({ mode: "open" });
    const input = makeInput(document, type);
    root.append(input);
    return input;
  };

  test("checkbox in a shadow root does not suppress", () => {
    expect(probe(shadowInput("checkbox"))).toEqual({ cs: 1, reg: 1 });
  });

  test("text in a shadow root is still ignored", () => {
    expect(probe(shadowInput("text"))).toEqual({ cs: 0, reg: 0 });
    expect(probe(shadowInput())).toEqual({ cs: 0, reg: 0 });
  });
});

describe("input types inside iframes", () => {
  const makeFrame = () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    return { win: iframe.contentWindow as unknown as Win, doc: iframe.contentDocument! };
  };

  test("checkbox in an iframe does not suppress (registry scoped to the iframe document)", () => {
    const { win, doc } = makeFrame();
    const input = makeInput(doc, "checkbox");
    doc.body.append(input);
    expect(input instanceof HTMLElement).toBe(false);
    const registry = makeShortcutRegistry({ scope: doc });
    const h = vi.fn();
    registry.register({ keys: "S", ignoreInputs: true, handler: h });
    fire(input, "s", "keydown", win.Event);
    fire(input, "s", "keyup", win.Event);
    expect(h).toHaveBeenCalledTimes(1);
    registry.clear();
  });

  test("text in an iframe is still ignored (registry scoped to the iframe document)", () => {
    const { win, doc } = makeFrame();
    const input = makeInput(doc, "text");
    doc.body.append(input);
    const registry = makeShortcutRegistry({ scope: doc });
    const h = vi.fn();
    registry.register({ keys: "S", ignoreInputs: true, handler: h });
    fire(input, "s", "keydown", win.Event);
    fire(input, "s", "keyup", win.Event);
    expect(h).not.toHaveBeenCalled();
    registry.clear();
  });

  test("probe helper: registry scoped to an iframe document, checkbox fires and text is ignored", () => {
    const { win, doc } = makeFrame();
    const checkbox = makeInput(doc, "checkbox");
    const text = makeInput(doc, "text");
    doc.body.append(checkbox, text);
    // events inside the iframe never reach the parent window, so createShortcut (cs) sees none
    expect(probe(checkbox, win.Event, doc)).toEqual({ cs: 0, reg: 1 });
    expect(probe(text, win.Event, doc)).toEqual({ cs: 0, reg: 0 });
  });
});
