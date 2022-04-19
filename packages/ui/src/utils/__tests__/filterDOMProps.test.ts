import { createRoot } from "solid-js";

import { filterDOMProps } from "..";

describe("filterDOMProps", () => {
  it("should include only valid DOM props", async () => {
    createRoot(async dispose => {
      const filteredProps = filterDOMProps({
        id: "test",
        foo: "bar",
      });

      expect(filteredProps).toHaveProperty("id", "test");
      expect(filteredProps).not.toHaveProperty("foo");

      dispose();
    });
  });

  it("should include labelling props when labellable option is set to true", async () => {
    createRoot(async dispose => {
      const filteredProps = filterDOMProps(
        {
          id: "test",
          foo: "bar",
          "aria-label": "baz",
        },
        { labelable: true }
      );

      expect(filteredProps).toHaveProperty("id", "test");
      expect(filteredProps).toHaveProperty("aria-label", "baz");
      expect(filteredProps).not.toHaveProperty("foo");

      dispose();
    });
  });

  it("should include custom props when propNames option is set", async () => {
    createRoot(async dispose => {
      const filteredProps = filterDOMProps(
        {
          id: "test",
          foo: "bar",
        },
        { propNames: new Set(["foo"]) }
      );

      expect(filteredProps).toHaveProperty("id", "test");
      expect(filteredProps).toHaveProperty("foo", "bar");

      dispose();
    });
  });

  it("should include data-* attributes", async () => {
    createRoot(async dispose => {
      const filteredProps = filterDOMProps({
        id: "test",
        "data-foo": "bar",
      });

      expect(filteredProps).toHaveProperty("id", "test");
      expect(filteredProps).toHaveProperty("data-foo", "bar");

      dispose();
    });
  });
});
