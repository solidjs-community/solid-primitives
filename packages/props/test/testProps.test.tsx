import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createRoot } from "solid-js";
import { createControlledProp, createControlledProps } from "../src";

const test = suite("createTestProp(s)");

test("will output a boolean prop signal and a field", () =>
  createRoot(dispose => {
    const [value, setValue, field] = createControlledProp("value", true);
    assert.is(value(), true);
    setValue(false);
    assert.is(value(), false);
    const label = field({}) as HTMLLabelElement;
    assert.instance(label, HTMLLabelElement);
    const input = label.querySelector("input")!;
    assert.instance(input, HTMLInputElement);
    assert.is(input.checked, false);
    input.checked = true;
    input.dispatchEvent(new Event("change"));
    assert.is(value(), true);
    dispose();
  }));

test("will output a number prop signal and a field", () =>
  createRoot(dispose => {
    const [value, setValue, field] = createControlledProp("value", 1);
    assert.is(value(), 1);
    setValue(7);
    assert.is(value(), 7);
    const label = field({}) as HTMLLabelElement;
    assert.instance(label, HTMLLabelElement);
    const input = label.querySelector("input")!;
    assert.instance(input, HTMLInputElement);
    assert.is(input.valueAsNumber, 7);
    input.valueAsNumber = 42;
    input.dispatchEvent(new Event("change"));
    assert.is(value(), 42);
    dispose();
  }));

test("will output a string prop signal and a field", () =>
  createRoot(dispose => {
    const [value, setValue, field] = createControlledProp("value", "prop");
    assert.is(value(), "prop");
    setValue("primitive");
    assert.is(value(), "primitive");
    const label = field({}) as HTMLLabelElement;
    assert.instance(label, HTMLLabelElement);
    const input = label.querySelector("input")!;
    assert.instance(input, HTMLInputElement);
    assert.is(input.value, "primitive");
    input.value = "works";
    input.dispatchEvent(new Event("change"));
    assert.is(value(), "works");
    dispose();
  }));

test("will output a select prop signal and a field from array", () =>
  createRoot(dispose => {
    const languages = ["de", "en", "it", "pl"];
    const [value, setValue, field] = createControlledProp("value", {
      initialValue: "en",
      options: languages
    });
    assert.is(value(), "en");
    setValue("pl");
    assert.is(value(), "pl");
    const label = field({}) as HTMLLabelElement;
    assert.instance(label, HTMLLabelElement);
    const select = label.querySelector("select")!;
    assert.instance(select, HTMLSelectElement);
    assert.is(select.selectedOptions[0].innerHTML, "pl");
    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
    assert.is(value(), "de");
    dispose();
  }));

test("will output a select prop signal and a field from enum", () =>
  createRoot(dispose => {
    enum Test {
      Zero,
      One,
      Two,
      Three
    }
    const [value, setValue, field] = createControlledProp("enum", {
      initialValue: Test.Two,
      options: Test
    });
    assert.is(value(), Test.Two);
    setValue(Test.One);
    assert.is(value(), Test.One);
    const label = field({}) as HTMLLabelElement;
    assert.instance(label, HTMLLabelElement);
    const select = label.querySelector("select")!;
    assert.instance(select, HTMLSelectElement);
    assert.is(select.selectedOptions[0].innerHTML, "One");
    select.selectedIndex = 0;
    select.dispatchEvent(new Event("change"));
    assert.is(value(), Test.Zero);
    dispose();
  }));

test("will create multiple props with createTestProps", () =>
  createRoot(dispose => {
    const languages = ["de", "en", "it", "pl"] as const;
    enum Test {
      Zero,
      One,
      Two,
      Three
    }
    const [props, fields] = createControlledProps({
      boolean: true,
      number: 42,
      string: "text",
      array: { initialValue: "en", options: languages },
      enum: { initialValue: Test.Three, options: Test }
    });
    assert.is(props.boolean(), true);
    assert.is(props.number(), 42);
    assert.is(props.string(), "text");
    assert.is(props.array(), "en");
    assert.is(props.enum(), Test.Three);
    props.setBoolean(false);
    props.setNumber(9);
    props.setString("test");
    props.setArray("pl");
    props.setEnum(Test.Zero);
    assert.is(props.boolean(), false);
    assert.is(props.number(), 9);
    assert.is(props.string(), "test");
    assert.is(props.array(), "pl");
    assert.is(props.enum(), Test.Zero);
    const div = document.createElement("div");
    fields.forEach(field => div.appendChild(field as HTMLLabelElement));
    const booleanInput: HTMLInputElement = div.querySelector('input[type="checkbox"]')!;
    const numberInput: HTMLInputElement = div.querySelector('input[type="number"]')!;
    const stringInput: HTMLInputElement = div.querySelector('input[type="text"]')!;
    const arraySelect: HTMLSelectElement = div.querySelector("select")!;
    const enumSelect: HTMLSelectElement = div.querySelector("label:last-child select")!;
    assert.instance(booleanInput, HTMLInputElement);
    assert.instance(numberInput, HTMLInputElement);
    assert.instance(stringInput, HTMLInputElement);
    assert.instance(arraySelect, HTMLSelectElement);
    assert.instance(enumSelect, HTMLSelectElement);
    booleanInput.checked = true;
    booleanInput.dispatchEvent(new Event("change"));
    assert.is(props.boolean(), true);
    numberInput.valueAsNumber = 17;
    numberInput.dispatchEvent(new Event("change"));
    assert.is(props.number(), 17);
    stringInput.value = "I like this!";
    stringInput.dispatchEvent(new Event("change"));
    assert.is(props.string(), "I like this!");
    arraySelect.selectedIndex = 2;
    arraySelect.dispatchEvent(new Event("change"));
    assert.is(props.array(), "it");
    enumSelect.selectedIndex = 1;
    enumSelect.dispatchEvent(new Event("change"));
    assert.is(props.enum(), Test.One);
  }));

test.run();
