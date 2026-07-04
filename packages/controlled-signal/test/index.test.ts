import { describe, it, expect, vi } from "vitest";
import { type Accessor, createRoot, createSignal, flush } from "solid-js";
import {
  createControllableSignal,
  createControllableBooleanSignal,
  createControllableArraySignal,
  createControllableSetSignal,
  createToggleState,
} from "../src/index.js";

describe("createControllableSignal", () => {
  describe("uncontrolled mode", () => {
    it("initializes with undefined when no defaultValue given", () => {
      createRoot(dispose => {
        const [value] = createControllableSignal<string>({});
        expect(value()).toBeUndefined();
        dispose();
      });
    });

    it("initializes with defaultValue", () => {
      createRoot(dispose => {
        const [value] = createControllableSignal({ defaultValue: () => "hello" });
        expect(value()).toBe("hello");
        dispose();
      });
    });

    it("updates internal state on setValue", () => {
      createRoot(dispose => {
        const [value, setValue] = createControllableSignal({ defaultValue: () => "hello" });
        setValue("world");
        flush();
        expect(value()).toBe("world");
        dispose();
      });
    });

    it("supports functional setter form", () => {
      createRoot(dispose => {
        const [value, setValue] = createControllableSignal({ defaultValue: () => 10 });
        setValue(prev => prev + 5);
        flush();
        expect(value()).toBe(15);
        dispose();
      });
    });

    it("accumulates functional updates correctly", () => {
      createRoot(dispose => {
        const [value, setValue] = createControllableSignal({ defaultValue: () => 0 });
        setValue(prev => prev + 1);
        flush();
        setValue(prev => prev + 1);
        flush();
        setValue(prev => prev + 1);
        flush();
        expect(value()).toBe(3);
        dispose();
      });
    });

    it("calls onChange on value change", () => {
      createRoot(dispose => {
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({ defaultValue: () => 0, onChange });
        setValue(42);
        expect(onChange).toHaveBeenCalledOnce();
        expect(onChange).toHaveBeenCalledWith(42);
        dispose();
      });
    });

    it("does not call onChange when value is unchanged (Object.is check)", () => {
      createRoot(dispose => {
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({
          defaultValue: () => "same",
          onChange,
        });
        setValue("same");
        expect(onChange).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("correctly deduplicates NaN values via Object.is", () => {
      createRoot(dispose => {
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({ defaultValue: () => NaN, onChange });
        setValue(NaN);
        expect(onChange).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("treats -0 and +0 as different via Object.is", () => {
      createRoot(dispose => {
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({ defaultValue: () => -0, onChange });
        setValue(+0);
        expect(onChange).toHaveBeenCalledOnce();
        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("returns the externally controlled value", () => {
      createRoot(dispose => {
        const [external] = createSignal("controlled");
        const [value] = createControllableSignal({ value: external });
        flush();
        expect(value()).toBe("controlled");
        dispose();
      });
    });

    it("calls onChange but does not update internal state", () => {
      createRoot(dispose => {
        const [external] = createSignal("controlled");
        const onChange = vi.fn();
        const [value, setValue] = createControllableSignal({ value: external, onChange });
        flush();
        setValue("new-value");
        flush();
        expect(value()).toBe("controlled");
        expect(onChange).toHaveBeenCalledWith("new-value");
        dispose();
      });
    });

    it("reflects changes to the external signal", () => {
      const [external, setExternal] = createSignal("initial");
      let value!: Accessor<string | undefined>;
      const dispose = createRoot(d => {
        [value] = createControllableSignal({ value: external });
        return d;
      });
      flush();
      expect(value()).toBe("initial");
      setExternal("updated");
      flush();
      expect(value()).toBe("updated");
      dispose();
    });

    it("wires onChange back to external signal for full controlled loop", () => {
      const [external, setExternal] = createSignal("initial");
      let value!: Accessor<string | undefined>;
      let setValue!: (next: string | ((prev: string) => string)) => void;
      const dispose = createRoot(d => {
        [value, setValue] = createControllableSignal({ value: external, onChange: setExternal });
        return d;
      });
      flush();
      setValue("updated");
      flush();
      expect(external()).toBe("updated");
      expect(value()).toBe("updated");
      dispose();
    });

    it("does not call onChange when controlled value is the same", () => {
      createRoot(dispose => {
        const [external] = createSignal("same");
        const onChange = vi.fn();
        const [, setValue] = createControllableSignal({ value: external, onChange });
        flush();
        setValue("same");
        expect(onChange).not.toHaveBeenCalled();
        dispose();
      });
    });

    it("treats undefined controlled value as uncontrolled (falls back to defaultValue)", () => {
      createRoot(dispose => {
        const [value] = createControllableSignal({
          value: () => undefined,
          defaultValue: () => "default",
        });
        flush();
        expect(value()).toBe("default");
        dispose();
      });
    });

    it("switches from controlled to uncontrolled when external value becomes undefined", () => {
      const [external, setExternal] = createSignal<string | undefined>("controlled");
      let value!: Accessor<string | undefined>;
      let setValue!: (next: string | ((prev: string) => string)) => void;
      const dispose = createRoot(d => {
        [value, setValue] = createControllableSignal({
          value: external,
          defaultValue: () => "default",
        });
        return d;
      });
      flush();
      expect(value()).toBe("controlled");
      setExternal(undefined);
      flush();
      expect(value()).toBe("default");
      // Now behaves as uncontrolled
      setValue("internal");
      flush();
      expect(value()).toBe("internal");
      dispose();
    });
  });
});

describe("createControllableBooleanSignal", () => {
  it("defaults to false when no props given", () => {
    createRoot(dispose => {
      const [value] = createControllableBooleanSignal({});
      expect(value()).toBe(false);
      dispose();
    });
  });

  it("uses defaultValue when provided", () => {
    createRoot(dispose => {
      const [value] = createControllableBooleanSignal({ defaultValue: () => true });
      expect(value()).toBe(true);
      dispose();
    });
  });

  it("toggles correctly", () => {
    createRoot(dispose => {
      const [value, setValue] = createControllableBooleanSignal({ defaultValue: () => false });
      setValue(prev => !prev);
      flush();
      expect(value()).toBe(true);
      setValue(prev => !prev);
      flush();
      expect(value()).toBe(false);
      dispose();
    });
  });

  it("always returns boolean (never undefined)", () => {
    createRoot(dispose => {
      const [value] = createControllableBooleanSignal({});
      expect(typeof value()).toBe("boolean");
      dispose();
    });
  });
});

describe("createControllableArraySignal", () => {
  it("defaults to empty array when no props given", () => {
    createRoot(dispose => {
      const [value] = createControllableArraySignal<string>({});
      expect(value()).toEqual([]);
      dispose();
    });
  });

  it("uses defaultValue when provided", () => {
    createRoot(dispose => {
      const [value] = createControllableArraySignal({ defaultValue: () => [1, 2, 3] });
      expect(value()).toEqual([1, 2, 3]);
      dispose();
    });
  });

  it("appends items via functional setter", () => {
    createRoot(dispose => {
      const [value, setValue] = createControllableArraySignal<number>({
        defaultValue: () => [1],
      });
      setValue(prev => [...prev, 2]);
      flush();
      expect(value()).toEqual([1, 2]);
      dispose();
    });
  });

  it("always returns an array (never undefined)", () => {
    createRoot(dispose => {
      const [value] = createControllableArraySignal<string>({});
      expect(Array.isArray(value())).toBe(true);
      dispose();
    });
  });
});

describe("createControllableSetSignal", () => {
  it("defaults to empty Set when no props given", () => {
    createRoot(dispose => {
      const [value] = createControllableSetSignal<string>({});
      expect(value()).toEqual(new Set());
      dispose();
    });
  });

  it("uses defaultValue when provided", () => {
    createRoot(dispose => {
      const [value] = createControllableSetSignal({ defaultValue: () => new Set([1, 2, 3]) });
      expect(value()).toEqual(new Set([1, 2, 3]));
      dispose();
    });
  });

  it("adds items via functional setter", () => {
    createRoot(dispose => {
      const [value, setValue] = createControllableSetSignal<number>({
        defaultValue: () => new Set([1]),
      });
      setValue(prev => new Set([...prev, 2]));
      flush();
      expect(value()).toEqual(new Set([1, 2]));
      dispose();
    });
  });

  it("always returns a Set (never undefined)", () => {
    createRoot(dispose => {
      const [value] = createControllableSetSignal<string>({});
      expect(value()).toBeInstanceOf(Set);
      dispose();
    });
  });
});

describe("createToggleState", () => {
  it("defaults to false when no props given", () => {
    createRoot(dispose => {
      const { isSelected } = createToggleState();
      expect(isSelected()).toBe(false);
      dispose();
    });
  });

  it("uses defaultIsSelected when provided", () => {
    createRoot(dispose => {
      const { isSelected } = createToggleState({ defaultIsSelected: () => true });
      expect(isSelected()).toBe(true);
      dispose();
    });
  });

  it("toggle() flips the selected state", () => {
    createRoot(dispose => {
      const { isSelected, toggle } = createToggleState({ defaultIsSelected: () => false });
      toggle();
      flush();
      expect(isSelected()).toBe(true);
      toggle();
      flush();
      expect(isSelected()).toBe(false);
      dispose();
    });
  });

  it("setIsSelected() sets the selected state directly", () => {
    createRoot(dispose => {
      const { isSelected, setIsSelected } = createToggleState();
      setIsSelected(true);
      flush();
      expect(isSelected()).toBe(true);
      dispose();
    });
  });

  it("calls onSelectedChange when the state changes", () => {
    createRoot(dispose => {
      const onSelectedChange = vi.fn();
      const { toggle } = createToggleState({ defaultIsSelected: () => false, onSelectedChange });
      toggle();
      expect(onSelectedChange).toHaveBeenCalledOnce();
      expect(onSelectedChange).toHaveBeenCalledWith(true);
      dispose();
    });
  });

  it("ignores toggle() and setIsSelected() while isDisabled", () => {
    createRoot(dispose => {
      const { isSelected, toggle, setIsSelected } = createToggleState({
        defaultIsSelected: () => false,
        isDisabled: () => true,
      });
      toggle();
      flush();
      expect(isSelected()).toBe(false);
      setIsSelected(true);
      flush();
      expect(isSelected()).toBe(false);
      dispose();
    });
  });

  it("ignores toggle() and setIsSelected() while isReadOnly", () => {
    createRoot(dispose => {
      const { isSelected, toggle, setIsSelected } = createToggleState({
        defaultIsSelected: () => false,
        isReadOnly: () => true,
      });
      toggle();
      flush();
      expect(isSelected()).toBe(false);
      setIsSelected(true);
      flush();
      expect(isSelected()).toBe(false);
      dispose();
    });
  });

  it("supports controlled mode", () => {
    const [external, setExternal] = createSignal(false);
    const onSelectedChange = vi.fn();
    let isSelected!: Accessor<boolean>;
    let toggle!: () => void;
    const dispose = createRoot(d => {
      ({ isSelected, toggle } = createToggleState({ isSelected: external, onSelectedChange }));
      return d;
    });
    flush();
    expect(isSelected()).toBe(false);

    toggle();
    // controlled mode: internal state doesn't change, only onSelectedChange fires
    expect(isSelected()).toBe(false);
    expect(onSelectedChange).toHaveBeenCalledOnce();
    expect(onSelectedChange).toHaveBeenCalledWith(true);

    setExternal(true);
    flush();
    expect(isSelected()).toBe(true);
    dispose();
  });
});
