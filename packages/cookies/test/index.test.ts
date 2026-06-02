import { beforeEach, describe, expect, it } from "vitest";
import { createRoot, flush } from "solid-js";
import { parseCookie, getCookiesString, createServerCookie, createUserTheme } from "../src/index.js";

beforeEach(() => {
  document.cookie.split(";").forEach(c => {
    const key = c.split("=")[0]!.trim();
    if (key) document.cookie = `${key}=;max-age=0`;
  });
});

// ── parseCookie ───────────────────────────────────────────────────────────────

describe("parseCookie", () => {
  it("extracts a value by key", () => {
    expect(parseCookie("foo=bar", "foo")).toBe("bar");
  });

  it("extracts a value from multiple cookies", () => {
    expect(parseCookie("foo=bar; baz=qux", "baz")).toBe("qux");
  });

  it("returns undefined for a missing key", () => {
    expect(parseCookie("foo=bar", "missing")).toBeUndefined();
  });

  it("returns undefined for an empty cookie string", () => {
    expect(parseCookie("", "foo")).toBeUndefined();
  });
});

// ── getCookiesString ──────────────────────────────────────────────────────────

describe("getCookiesString", () => {
  it("returns document.cookie on the client", () => {
    document.cookie = "ck_test=hello";
    expect(getCookiesString()).toContain("ck_test=hello");
  });
});

// ── createServerCookie ────────────────────────────────────────────────────────

describe("createServerCookie", () => {
  it("initializes signal from the current cookie value", () => {
    document.cookie = "ck_init=world";
    const dispose = createRoot(dispose => {
      const [cookie] = createServerCookie("ck_init");
      expect(cookie()).toBe("world");
      return dispose;
    });
    dispose();
  });

  it("initializes to undefined when the cookie is absent", () => {
    const dispose = createRoot(dispose => {
      const [cookie] = createServerCookie("ck_absent");
      expect(cookie()).toBeUndefined();
      return dispose;
    });
    dispose();
  });

  it("setter updates the signal value", () => {
    document.cookie = "ck_set=before";
    const { setCookie, dispose } = createRoot(dispose => {
      const [, setCookie] = createServerCookie("ck_set");
      return { setCookie, dispose };
    });
    flush();
    setCookie("after");
    flush();
    expect(parseCookie(document.cookie, "ck_set")).toBe("after");
    dispose();
  });

  it("writes to document.cookie when value changes", () => {
    document.cookie = "ck_write=old";
    const { setCookie, dispose } = createRoot(dispose => {
      const [, setCookie] = createServerCookie("ck_write");
      return { setCookie, dispose };
    });
    flush();
    setCookie("new");
    flush();
    expect(parseCookie(document.cookie, "ck_write")).toBe("new");
    dispose();
  });

  it("does not overwrite the cookie when the serialized value is unchanged", () => {
    document.cookie = "ck_same=abc";
    const { cookie, setCookie, dispose } = createRoot(dispose => {
      const [cookie, setCookie] = createServerCookie("ck_same");
      return { cookie, setCookie, dispose };
    });
    flush();
    setCookie("abc");
    flush();
    expect(cookie()).toBe("abc");
    expect(parseCookie(document.cookie, "ck_same")).toBe("abc");
    dispose();
  });

  it("applies a custom deserialize function", () => {
    document.cookie = "ck_deser=42";
    const dispose = createRoot(dispose => {
      const [count] = createServerCookie("ck_deser", {
        deserialize: str => (str !== undefined ? parseInt(str, 10) : 0),
        serialize: String,
      });
      expect(count()).toBe(42);
      return dispose;
    });
    dispose();
  });

  it("applies a custom serialize function", () => {
    const { setTags, dispose } = createRoot(dispose => {
      const [, setTags] = createServerCookie<string[]>("ck_ser", {
        deserialize: str => (str ? str.split(",") : []),
        serialize: val => val.join(","),
      });
      return { setTags, dispose };
    });
    flush();
    setTags(["a", "b", "c"]);
    flush();
    expect(parseCookie(document.cookie, "ck_ser")).toBe("a,b,c");
    dispose();
  });

  it("clears the cookie when value is set to undefined", () => {
    document.cookie = "ck_clear=present";
    const { setCookie, dispose } = createRoot(dispose => {
      const [, setCookie] = createServerCookie("ck_clear");
      return { setCookie, dispose };
    });
    flush();
    (setCookie as (v: string | undefined) => void)(undefined);
    flush();
    expect(parseCookie(document.cookie, "ck_clear")).toBeUndefined();
    dispose();
  });

  it("does not store the string 'undefined' when value is undefined", () => {
    const { dispose } = createRoot(dispose => {
      createServerCookie("ck_undef");
      return { dispose };
    });
    flush();
    expect(parseCookie(document.cookie, "ck_undef")).not.toBe("undefined");
    dispose();
  });

  it("respects a custom cookieMaxAge option", () => {
    const { setCookie, dispose } = createRoot(dispose => {
      const [, setCookie] = createServerCookie("ck_age", { cookieMaxAge: 60 });
      return { setCookie, dispose };
    });
    flush();
    setCookie("x");
    flush();
    expect(parseCookie(document.cookie, "ck_age")).toBe("x");
    dispose();
  });
});

// ── createUserTheme ───────────────────────────────────────────────────────────

describe("createUserTheme", () => {
  it("reads a stored theme from the cookie", () => {
    document.cookie = "ck_theme=dark";
    const dispose = createRoot(dispose => {
      const [theme] = createUserTheme("ck_theme");
      expect(theme()).toBe("dark");
      return dispose;
    });
    dispose();
  });

  it("returns undefined for an unrecognized theme value", () => {
    document.cookie = "ck_theme2=blue";
    const dispose = createRoot(dispose => {
      const [theme] = createUserTheme("ck_theme2");
      expect(theme()).toBeUndefined();
      return dispose;
    });
    dispose();
  });

  it("returns undefined when no cookie is set and no default is provided", () => {
    const dispose = createRoot(dispose => {
      const [theme] = createUserTheme("ck_theme3");
      expect(theme()).toBeUndefined();
      return dispose;
    });
    dispose();
  });

  it("uses the defaultValue when cookie is absent", () => {
    const dispose = createRoot(dispose => {
      const [theme] = createUserTheme("ck_theme4", { defaultValue: "light" });
      expect(theme()).toBe("light");
      return dispose;
    });
    dispose();
  });

  it("accepts 'light' and 'dark' as valid values", () => {
    document.cookie = "ck_theme5=light";
    const dispose = createRoot(dispose => {
      const [theme] = createUserTheme("ck_theme5");
      expect(theme()).toBe("light");
      return dispose;
    });
    dispose();
  });

  it("persists a theme change to document.cookie", () => {
    const { setTheme, dispose } = createRoot(dispose => {
      const [, setTheme] = createUserTheme("ck_theme6");
      return { setTheme, dispose };
    });
    flush();
    setTheme("dark");
    flush();
    expect(parseCookie(document.cookie, "ck_theme6")).toBe("dark");
    dispose();
  });
});
