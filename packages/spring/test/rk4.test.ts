import { describe, it, expect } from "vitest";
import { integrateRK4, rubberBandClamp, type SpringPhysicsState } from "../src/rk4";

describe("RK4 & Rubber-Band Physics Integrator", () => {
  it("converges toward target equilibrium over multiple RK4 steps", () => {
    let state: SpringPhysicsState = { position: 0, velocity: 0 };
    const target = 100;
    const dt = 1 / 60;
    const config = { stiffness: 180, damping: 12, mass: 1.0 };

    for (let frame = 0; frame < 60; frame++) {
      state = integrateRK4(state, target, dt, config);
    }

    expect(state.position).toBeCloseTo(100, 0);
    expect(Math.abs(state.velocity)).toBeLessThan(5);
  });

  it("applies asymptotic rubber-band damping outside boundaries", () => {
    const min = 0;
    const max = 500;
    expect(rubberBandClamp(250, min, max)).toBe(250);

    const overshootingUpper = rubberBandClamp(600, min, max, 1000, 0.55);
    expect(overshootingUpper).toBeGreaterThan(500);
    expect(overshootingUpper).toBeLessThan(600);
  });
});
