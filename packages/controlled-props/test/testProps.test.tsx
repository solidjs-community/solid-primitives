import { describe, expect, test } from "vitest";
import { createRoot } from "solid-js";
import { createControlledProp, createControlledProps } from "../src";

describe("createControlledProp", () => {
  test("will output a boolean prop signal and a field", () =>
    createRoot(dispose => {
      const [value, setValue, field] = createControlledProp("value", true);
      expect(value()).toBe(true);
      setValue(false);
      expect(value()).toBe(false);
      const label = field({}) as HTMLLabelElement;
      expect(label).instanceOf(HTMLLabelElement);
      const input = label.querySelector("input")!;
      expect(input).instanceOf(HTMLInputElement);
      expect(input.checked).toBe(false);
      input.checked = true;
      input.dispatchEvent(new Event("change"));
      expect(value()).toBe(true);
      dispose();
    }));

  test("will output a number prop signal and a field", () =>
    createRoot(dispose => {
      const [value, setValue, field] = createControlledProp("value", 1);
      expect(value()).toBe(1);
      setValue(7);
      expect(value()).toBe(7);
      const label = field({}) as HTMLLabelElement;
      expect(label).instanceOf(HTMLLabelElement);
      const input = label.querySelector("input")!;
      expect(input).instanceOf(HTMLInputElement);
      expect(input.valueAsNumber).toBe(7);
      input.valueAsNumber = 42;
      input.dispatchEvent(new Event("change"));
      expect(value()).toBe(42);
      dispose();
    }));

  test("will output a string prop signal and a field", () =>
    createRoot(dispose => {
      const [value, setValue, field] = createControlledProp("value", "prop");
      expect(value()).toBe("prop");
      setValue("primitive");
      expect(value()).toBe("primitive");
      const label = field({}) as HTMLLabelElement;
      expect(label).instanceOf(HTMLLabelElement);
      const input = label.querySelector("input")!;
      expect(input).instanceOf(HTMLInputElement);
      expect(input.value).toBe("primitive");
      input.value = "works";
      input.dispatchEvent(new Event("change"));
      expect(value()).toBe("works");
      dispose();
    }));

  test("will output a select prop signal and a field from array", () =>
    createRoot(dispose => {
      const languages = ["de", "en", "it", "pl"];
      const [value, setValue, field] = createControlledProp("value", {
        initialValue: "en",
        options: languages,
      });
      expect(value()).toBe("en");
      setValue("pl");
      expect(value()).toBe("pl");
      const label = field({}) as HTMLLabelElement;
      expect(label).instanceOf(HTMLLabelElement);
      const select = label.querySelector("select")!;
      expect(select).instanceOf(HTMLSelectElement);
      expect(select.selectedOptions[0].innerHTML).toBe("pl");
      select.selectedIndex = 0;
      select.dispatchEvent(new Event("change"));
      expect(value()).toBe("de");
      dispose();
    }));

  test("will output a select prop signal and a field from enum", () =>
    createRoot(dispose => {
      enum Test {
        Zero,
        One,
        Two,
        Three,
      }
      const [value, setValue, field] = createControlledProp("enum", {
        initialValue: Test.Two,
        options: Test,
      });
      expect(value()).toBe(Test.Two);
      setValue(Test.One);
      expect(value()).toBe(Test.One);
      const label = field({}) as HTMLLabelElement;
      expect(label).instanceOf(HTMLLabelElement);
      const select = label.querySelector("select")!;
      expect(select).instanceOf(HTMLSelectElement);
      expect(select.selectedOptions[0].innerHTML).toBe("One");
      select.selectedIndex = 0;
      select.dispatchEvent(new Event("change"));
      expect(value()).toBe(Test.Zero);
      dispose();
    }));

  test("will create multiple props with createTestProps", () =>
    createRoot(dispose => {
      const languages = ["de", "en", "it", "pl"] as const;
      enum Test {
        Zero,
        One,
        Two,
        Three,
      }
      const [props, fields] = createControlledProps({
        boolean: true,
        number: 42,
        string: "text",
        array: { initialValue: "en", options: languages },
        enum: { initialValue: Test.Three, options: Test },
      });
      expect(props.boolean()).toBe(true);
      expect(props.number()).toBe(42);
      expect(props.string()).toBe("text");
      expect(props.array()).toBe("en");
      expect(props.enum()).toBe(Test.Three);
      props.setBoolean(false);
      props.setNumber(9);
      props.setString("test");
      props.setArray("pl");
      props.setEnum(Test.Zero);
      expect(props.boolean()).toBe(false);
      expect(props.number()).toBe(9);
      expect(props.string()).toBe("test");
      expect(props.array()).toBe("pl");
      expect(props.enum()).toBe(Test.Zero);
      const div = document.createElement("div");
      fields.forEach(field => div.appendChild(field as HTMLLabelElement));
      const booleanInput: HTMLInputElement = div.querySelector('input[type="checkbox"]')!;
      const numberInput: HTMLInputElement = div.querySelector('input[type="number"]')!;
      const stringInput: HTMLInputElement = div.querySelector('input[type="text"]')!;
      const arraySelect: HTMLSelectElement = div.querySelector("select")!;
      const enumSelect: HTMLSelectElement = div.querySelector("label:last-child select")!;
      expect(booleanInput).instanceOf(HTMLInputElement);
      expect(numberInput).instanceOf(HTMLInputElement);
      expect(stringInput).instanceOf(HTMLInputElement);
      expect(arraySelect).instanceOf(HTMLSelectElement);
      expect(enumSelect).instanceOf(HTMLSelectElement);
      booleanInput.checked = true;
      booleanInput.dispatchEvent(new Event("change"));
      expect(props.boolean()).toBe(true);
      numberInput.valueAsNumber = 17;
      numberInput.dispatchEvent(new Event("change"));
      expect(props.number()).toBe(17);
      stringInput.value = "I like this!";
      stringInput.dispatchEvent(new Event("change"));
      expect(props.string()).toBe("I like this!");
      arraySelect.selectedIndex = 2;
      arraySelect.dispatchEvent(new Event("change"));
      expect(props.array()).toBe("it");
      enumSelect.selectedIndex = 1;
      enumSelect.dispatchEvent(new Event("change"));
      expect(props.enum()).toBe(Test.One);
    }));
});
