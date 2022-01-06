import { suite } from "uvu";
import * as assert from "uvu/assert";
import { getDate, getTime } from "../src";

const getDateTest = suite("getDate");

getDateTest("transforms init values to a date", () => {
  const inputString = "2020 1 11"; // 1578697200000
  const inputNumber = 1641408329089;
  const inputDate = new Date();

  assert.instance(getDate(inputString), Date);
  assert.is(getDate(inputString).getTime(), 1578697200000);
  assert.instance(getDate(inputNumber), Date);
  assert.is(getDate(inputNumber).getTime(), 1641408329089);
  assert.is(getDate(inputDate), inputDate);
});

getDateTest.run();

const getTimeTest = suite("getTime");

getTimeTest("transforms init values to a timestamp", () => {
  const inputString = "2020 1 11"; // 1578697200000
  const inputNumber = 1641408329089;
  const inputDate = new Date("2020 1 11");

  assert.is(getTime(inputString), 1578697200000);
  assert.is(getTime(inputNumber), 1641408329089);
  assert.is(getTime(inputDate), 1578697200000);
});

getTimeTest.run();
