import { describe, expect, test, vi } from "vitest";
import { DEV } from "solid-js";
import * as i18n from "../src/index.js";

describe("resolveRichTemplate", () => {
  test("matches resolveTemplate when every value is a string", () => {
    expect(i18n.resolveRichTemplate("hello {{ name }}!", { name: "Tester" })).toBe("hello Tester!");
    expect(i18n.resolveRichTemplate("hello!")).toBe("hello!");
    expect(i18n.resolveRichTemplate("hello {{name}}!")).toBe("hello {{name}}!");
  });

  test("stays a plain string when a placeholder has no matching arg", () => {
    expect(i18n.resolveRichTemplate("hello {{name}} and {{extra}}!", { name: "Tester" })).toBe(
      "hello Tester and {{extra}}!",
    );
  });

  test("returns JSX when a value isn't a string", () => {
    const link = <a href="/info">click here</a>;

    const result = i18n.resolveRichTemplate("For more information, {{ clickHere }}", {
      clickHere: link,
    }) as unknown as unknown[];

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual(["For more information, ", link, ""]);
  });

  test("splices multiple values, mixed string and JSX, in order", () => {
    const bold = <b>world</b>;

    const result = i18n.resolveRichTemplate("{{ greeting }}, {{ name }}!", {
      greeting: "hello",
      name: bold,
    }) as unknown as unknown[];

    expect(result).toEqual(["", "hello", ", ", bold, "!"]);
  });
});

describe("richText", () => {
  test("calls the tag renderer with the tag's inner content", () => {
    const dict = { message: "Please refer to <guidelines>the guidelines</guidelines>" };
    const t = i18n.translator(() => dict, i18n.resolveTemplate);

    const result = i18n.richText(t("message"), {
      guidelines: text => <a href="/guidelines">{text}</a>,
    }) as unknown as unknown[];

    expect(result).toEqual(["Please refer to ", <a href="/guidelines">the guidelines</a>, ""]);
  });

  test("composes with resolveTemplate for {{ }} variables inside a tag", () => {
    const dict = { message: "See <guidelines>{{ name }}</guidelines> for details." };
    const t = i18n.translator(() => dict, i18n.resolveTemplate);

    const result = i18n.richText(t("message", { name: "the guidelines" }), {
      guidelines: text => <a href="/guidelines">{text}</a>,
    }) as unknown as unknown[];

    expect(result).toEqual(["See ", <a href="/guidelines">the guidelines</a>, " for details."]);
  });

  test("plain string with no tags is passed through untouched", () => {
    const result = i18n.richText("just plain text", {}) as unknown as unknown[];
    expect(result).toEqual(["just plain text"]);
  });

  test("unmapped tag renders its contents as plain text", () => {
    const result = i18n.richText("hello <b>world</b>!", {}) as unknown as unknown[];
    expect(result).toEqual(["hello ", "world", "!"]);
  });

  test("unmapped tag warns in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    i18n.richText("hello <b>world</b>!", {});

    if (DEV) {
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0]![0]).toContain("<b>");
    } else {
      expect(warn).not.toHaveBeenCalled();
    }

    warn.mockRestore();
  });
  test("unclosed tags are left as literal text", () => {
    expect(i18n.richText("a <b>b and <i>c</i>", { i: t => t }) as unknown as unknown[]).toEqual([
      "a <b>b and ",
      "c",
      "",
    ]);
    expect(i18n.richText("1 < 2 > 0", {}) as unknown as unknown[]).toEqual(["1 < 2 > 0"]);
  });

  test("handles adjacent and repeated tags", () => {
    const t = { b: (c: any) => `[${c}]` };
    expect(i18n.richText("<b>x</b><b>y</b> <b>z</b>", t) as unknown as unknown[]).toEqual([
      "",
      "[x]",
      "",
      "[y]",
      " ",
      "[z]",
      "",
    ]);
  });

  test("a closer only counts for the matching tag name", () => {
    const t = { b: (c: any) => `[${c}]` };
    expect(i18n.richText("<b>x</i></b>", t) as unknown as unknown[]).toEqual(["", "[x</i>]", ""]);
  });

  test("does not call inherited Object properties as tag renderers", () => {
    const result = i18n.richText("<constructor>x</constructor>", {}) as unknown as unknown[];
    expect(result).toEqual(["", "x", ""]);
  });

  test("runs in linear time on many unclosed tags", () => {
    const evil = "<a>".repeat(60_000) + "a";
    const start = performance.now();
    const result = i18n.richText(evil, {}) as unknown as unknown[];
    const elapsed = performance.now() - start;
    expect(result).toEqual([evil]);
    // A rescan-per-tag regex needs several seconds here; the linear version needs milliseconds.
    expect(elapsed).toBeLessThan(500);
  });

  test("runs in linear time on many unclosed tags with a closer for one other tag", () => {
    const evil = "<a>".repeat(30_000) + "<b>x</b>";
    const start = performance.now();
    const result = i18n.richText(evil, { b: c => c }) as unknown as unknown[];
    expect(performance.now() - start).toBeLessThan(500);
    expect(result.at(-2)).toBe("x");
  });

  test("runs in linear time on many distinct unclosed tag names", () => {
    const evil = Array.from({ length: 40_000 }, (_, i) => `<t${i}>`).join("") + "x";
    const start = performance.now();
    const result = i18n.richText(evil, {}) as unknown as unknown[];
    const elapsed = performance.now() - start;
    expect(result).toEqual([evil]);
    expect(elapsed).toBeLessThan(500);
  });

  test("matches a reference implementation on generated input", () => {
    // The previous, regex-per-iteration implementation, kept as an oracle for output equivalence.
    const reference = (string: string, tags: i18n.RichTextTags) => {
      const re = /<(\w+)>([\s\S]*?)<\/\1>/;
      const out: unknown[] = [];
      let rest = string;
      let m: RegExpExecArray | null;
      while ((m = re.exec(rest))) {
        out.push(rest.slice(0, m.index));
        const render = Object.prototype.hasOwnProperty.call(tags, m[1]!) ? tags[m[1]!] : undefined;
        out.push(render ? render(m[2]!) : m[2]!);
        rest = rest.slice(m.index + m[0].length);
      }
      out.push(rest);
      return out;
    };
    const tags: i18n.RichTextTags = { a: c => `<A:${c}>`, b: c => `<B:${c}>` };
    const pieces = ["<a>", "</a>", "<b>", "</b>", "<c>", "</c>", "x", " ", "<", ">", "</", "<a1>"];
    let seed = 12345;
    const next = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    for (let n = 0; n < 500; n++) {
      let input = "";
      for (let k = next() % 14; k > 0; k--) input += pieces[next() % pieces.length];
      expect(i18n.richText(input, tags), input).toEqual(reference(input, tags));
    }
    warn.mockRestore();
  });
});
