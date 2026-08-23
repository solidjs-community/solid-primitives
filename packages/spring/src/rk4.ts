export interface SpringPhysicsState {
  position: number;
  velocity: number;
}

export interface SpringPhysicsConfig {
  stiffness: number;
  damping: number;
  mass?: number;
}

function computeAcceleration(
  pos: number,
  vel: number,
  target: number,
  cfg: SpringPhysicsConfig,
): number {
  const m = cfg.mass ?? 1.0;
  const displacement = pos - target;
  const springForce = -cfg.stiffness * displacement;
  const dampingForce = -cfg.damping * vel;
  return (springForce + dampingForce) / m;
}

export function integrateRK4(
  state: SpringPhysicsState,
  target: number,
  dt: number,
  cfg: SpringPhysicsConfig,
): SpringPhysicsState {
  const x = state.position;
  const v = state.velocity;

  const a1 = computeAcceleration(x, v, target, cfg);
  const dx1 = v;
  const dv1 = a1;

  const x2 = x + 0.5 * dt * dx1;
  const v2 = v + 0.5 * dt * dv1;
  const a2 = computeAcceleration(x2, v2, target, cfg);
  const dx2 = v2;
  const dv2 = a2;

  const x3 = x + 0.5 * dt * dx2;
  const v3 = v + 0.5 * dt * dv2;
  const a3 = computeAcceleration(x3, v3, target, cfg);
  const dx3 = v3;
  const dv3 = a3;

  const x4 = x + dt * dx3;
  const v4 = v + dt * dv3;
  const a4 = computeAcceleration(x4, v4, target, cfg);
  const dx4 = v4;
  const dv4 = a4;

  const nextPos = x + (dt / 6) * (dx1 + 2 * dx2 + 2 * dx3 + dx4);
  const nextVel = v + (dt / 6) * (dv1 + 2 * dv2 + 2 * dv3 + dv4);

  return {
    position: nextPos,
    velocity: nextVel,
  };
}

export function rubberBandClamp(
  value: number,
  min: number,
  max: number,
  dimension = 1000,
  constant = 0.55,
): number {
  if (value >= min && value <= max) {
    return value;
  }

  const overshooting = value < min;
  const edge = overshooting ? min : max;
  const distance = Math.abs(value - edge);

  const dampedDistance =
    (distance * dimension * constant) / (dimension + constant * distance);

  return overshooting ? edge - dampedDistance : edge + dampedDistance;
}
