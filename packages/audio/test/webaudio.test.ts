import { describe, it, expect, vi } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { createAudioParam } from "../src/webaudio";

describe("createAudioParam", () => {
  it("schedules parameter value updates on signal transition", () => {
    createRoot(dispose => {
      const [gain, setGain] = createSignal(0.5);

      const mockParam = {
        value: 0.5,
        context: { currentTime: 1.0 },
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        cancelScheduledValues: vi.fn(),
      } as unknown as AudioParam;

      createAudioParam(mockParam, gain, { ramp: "linear", timeConstant: 0.05 });
      expect(mockParam.setValueAtTime).toHaveBeenCalledWith(0.5, 1.0);
      dispose();
    });
  });
});
