import { createEventDispatcher } from "../src";
import { createRoot, createSignal } from "solid-js";
import { describe, test, expect } from "vitest";
interface Props {
  onChangeStep: (evt: CustomEvent<string>) => void;
  onCancel: (evt: CustomEvent<null>) => void;
  onNullableEvent?: () => void;
  nonEvent: string;
}

describe("createEventDispatcher primitive test", () => {
  test("createEventDispatcher return values and callback execution", () =>
    createRoot(dispose => {
      const [step, setStep] = createSignal("first");
      const props: Props = {
        onChangeStep: evt => setStep(evt.detail),
        onCancel: evt => {
          evt.preventDefault();
          setStep("one after the " + step());
        },
        nonEvent: "not an event",
      };

      const dispatch = createEventDispatcher(props);

      expect(
        dispatch("changeStep", "second"),
        "it should return true, as the callback has been called and the event is not cancellable",
      ).toBe(true);

      expect(step(), "step should have changed to second").toBe("second");

      expect(
        dispatch("nullableEvent"),
        "no callback, should return true without throwing an error",
      ).toBe(true);

      expect(
        dispatch("cancel", null, { cancelable: true }),
        "it should return false, as the event was cancelable and preventDefault was invoked",
      ).toBe(false);

      expect(step(), "the callback should be reactive to the props change").toBe(
        "one after the second",
      );

      dispose();
    }));
});
