import { describe, it, expect } from "vitest";
import { createRoot, flush } from "solid-js";
import { createForm } from "../src/index.js";

// One `form.bind("x")` callback may be attached to several elements (a callback kept in a
// variable and reused, an array of refs...). Each attachment must keep its own state and
// lifetime: they must not overwrite each other or dispose each other's synchronization.

const input = (type?: string) => {
  const el = document.createElement("input");
  if (type) el.type = type;
  return el;
};

describe("one bind() callback attached to several elements", () => {
  it("keeps every attached element in sync with the field", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "x" } } });
      const attach = form.bind("email");
      const a = input();
      const b = input();
      attach(a);
      attach(b);
      expect([a.value, b.value]).toEqual(["x", "x"]);

      form.fields.email.setValue("y");
      flush();
      expect([a.value, b.value]).toEqual(["y", "y"]);
      dispose();
    });
  });

  it("each element writes to the field through its own listener", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "" } } });
      const attach = form.bind("email");
      const a = input();
      const b = input();
      attach(a);
      attach(b);

      a.value = "from-a";
      a.dispatchEvent(new Event("input"));
      flush();
      expect(form.fields.email.value()).toBe("from-a");

      b.value = "from-b";
      b.dispatchEvent(new Event("input"));
      flush();
      expect(form.fields.email.value()).toBe("from-b");
      // and the other element follows
      expect(a.value).toBe("from-b");
      dispose();
    });
  });

  it("each listener uses its own element's classification (checkable vs text)", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { v: { initial: "" as any } } });
      const attach = form.bind("v");
      const box = input("checkbox");
      const text = input();
      attach(box);
      attach(text);

      box.checked = true;
      box.dispatchEvent(new Event("change"));
      flush();
      expect(form.fields.v.value()).toBe(true);

      text.value = "typed";
      text.dispatchEvent(new Event("input"));
      flush();
      expect(form.fields.v.value()).toBe("typed");
      dispose();
    });
  });

  it("cleaning up one element leaves the others attached and in sync", () => {
    createRoot(dispose => {
      const form = createForm({ fields: { email: { initial: "x" } } });
      const attach = form.bind("email");
      const a = input();
      const b = input();
      const offA = attach(a);
      attach(b);

      offA();
      form.fields.email.setValue("z");
      flush();
      expect(b.value).toBe("z");
      expect(a.value).toBe("x"); // detached: no longer driven by the field

      a.value = "ignored";
      a.dispatchEvent(new Event("input"));
      flush();
      expect(form.fields.email.value()).toBe("z");
      dispose();
    });
  });

  it("disposing the owner removes every attachment", () => {
    let form!: ReturnType<typeof createForm<{ email: { initial: string } }>>;
    const a = input();
    const b = input();
    createRoot(dispose => {
      form = createForm({ fields: { email: { initial: "" } } });
      const attach = form.bind("email");
      attach(a);
      attach(b);
      dispose();
    });

    for (const el of [a, b]) {
      el.value = "after-dispose";
      el.dispatchEvent(new Event("input"));
      el.dispatchEvent(new Event("blur"));
    }
    flush();
    expect(form.fields.email.value()).toBe("");
    expect(form.fields.email.touched()).toBe(false);
  });

  describe("without an owner", () => {
    // The factory is called outside any owner (an event handler, a plain function), so the
    // field -> DOM effect lives in a root that follows the attachments.
    const ownerless = () => {
      let form!: ReturnType<typeof createForm<{ email: { initial: string } }>>;
      const dispose = createRoot(d => {
        form = createForm({ fields: { email: { initial: "x" } } });
        return d;
      });
      return { form, dispose, attach: form.bind("email") };
    };

    it("cleaning up one element does not stop synchronization for the others", () => {
      const { form, dispose, attach } = ownerless();
      const a = input();
      const b = input();
      const offA = attach(a);
      attach(b);

      offA();
      form.fields.email.setValue("z");
      flush();
      expect(b.value).toBe("z");
      dispose();
    });

    it("stops synchronizing after the last element is cleaned up, and resumes on re-attach", () => {
      const { form, dispose, attach } = ownerless();
      const a = input();
      const offA = attach(a);
      offA();

      form.fields.email.setValue("while-detached");
      flush();
      expect(a.value).toBe("x"); // root disposed: nothing drives the detached element

      const b = input();
      attach(b);
      expect(b.value).toBe("while-detached"); // initial sync on attach
      form.fields.email.setValue("again");
      flush();
      expect(b.value).toBe("again"); // root recreated
      dispose();
    });

    it("calling a cleanup twice does not dispose another element's synchronization", () => {
      const { form, dispose, attach } = ownerless();
      const a = input();
      const b = input();
      const offA = attach(a);
      attach(b);

      offA();
      offA();
      form.fields.email.setValue("still-synced");
      flush();
      expect(b.value).toBe("still-synced");
      dispose();
    });
  });
});
