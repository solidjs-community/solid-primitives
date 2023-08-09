import { describe, it, expect } from "vitest";
import { getDate, getTime } from "../src/index.js";

describe("getDate", () => {
  it("transforms init values to a date", () => {
    const inputString = "2020 1 11"; // 1578697200000
    const inputNumber = 1641408329089;
    const inputDate = new Date();

    expect(getDate(inputString)).toBeInstanceOf(Date);
    // assert.is(getDate(inputString).getTime(), 1578697200000);
    expect(getDate(inputNumber)).toBeInstanceOf(Date);
    expect(getDate(inputNumber).getTime()).toBe(1641408329089);
    expect(getDate(inputDate)).toBe(inputDate);
  });
});

describe("getTime", () => {
  it("transforms init values to a timestamp", () => {
    const inputString = "2020 1 11"; // 1578697200000
    const inputNumber = 1641408329089;
    const inputDate = new Date("2020 1 11");

    expect(typeof getTime(inputString)).toBe("number");
    expect(getTime(inputNumber)).toBe(1641408329089);
    expect(typeof getTime(inputDate)).toBe("number");
  });
});
