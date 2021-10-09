import createThrottle from "../src/index";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe("createThrottle", () => {
  test("setup and trigger throttle", async () => {
    let val = 0;
    const [trigger] = createThrottle(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    await sleep(300);
    expect(val).toBe(5);
  });
  test("trigger multiple throttles", async () => {
    let val = 0;
    const [trigger] = createThrottle(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    trigger(1);
    await sleep(300);
    expect(val).toBe(5);
  });
  test("test clearing throttle", async () => {
    let val = 0;
    const [trigger, clear] = createThrottle(current => (val = current), 150);
    expect(val).toBe(0);
    trigger(5);
    clear();
    await sleep(300);
    expect(val).toBe(0);
  });
});
