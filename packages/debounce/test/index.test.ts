import createDebounce from "../src/index";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("createDebounce", () => {
  test("setup and trigger debounce", async () => {
    let val = 0;
    const [trigger] = createDebounce(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    await sleep(300);
    expect(val).toBe(5);
  });
  test("trigger multiple debounce", async () => {
    let val = 0;
    const [trigger] = createDebounce(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    trigger(1);
    await sleep(300);
    expect(val).toBe(1);
  });
  test("test clearing debounce", async () => {
    let val = 0;
    const [trigger, clear] = createDebounce(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    clear();
    await sleep(300);
    expect(val).toBe(0);
  });
});
