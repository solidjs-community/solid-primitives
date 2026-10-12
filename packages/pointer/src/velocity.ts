import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";

export interface PointerVelocityState {
  vx: number;
  vy: number;
  speed: number;
}

export interface PointerVelocityOptions {
  sampleWindowMs?: number;
}

export function createPointerVelocity(
  target: EventTarget | Accessor<EventTarget | null | undefined> = typeof window !== "undefined" ? window : (null as any),
  options: PointerVelocityOptions = {},
): Accessor<PointerVelocityState> {
  if (isServer || typeof window === "undefined") {
    return () => ({ vx: 0, vy: 0, speed: 0 });
  }

  const [velocity, setVelocity] = createSignal<PointerVelocityState>({
    vx: 0,
    vy: 0,
    speed: 0,
  });

  const windowMs = options.sampleWindowMs ?? 50;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;
  let decayTimer: ReturnType<typeof setTimeout> | null = null;

  const onPointerMove = (e: Event) => {
    const pe = e as PointerEvent;
    const now = performance.now();

    if (lastTime > 0) {
      const dt = (now - lastTime) / 1000;
      if (dt > 0.001) {
        const vx = (pe.clientX - lastX) / dt;
        const vy = (pe.clientY - lastY) / dt;
        const speed = Math.hypot(vx, vy);

        setVelocity({ vx, vy, speed });
      }
    }

    lastX = pe.clientX;
    lastY = pe.clientY;
    lastTime = now;

    if (decayTimer !== null) {
      clearTimeout(decayTimer);
    }
    decayTimer = setTimeout(() => {
      setVelocity({ vx: 0, vy: 0, speed: 0 });
      lastTime = 0;
    }, windowMs);
  };

  const resolvedTarget = typeof target === "function" ? target() : target;
  const eventTarget = resolvedTarget || window;

  eventTarget.addEventListener("pointermove", onPointerMove as EventListener);

  onCleanup(() => {
    eventTarget.removeEventListener("pointermove", onPointerMove as EventListener);
    if (decayTimer !== null) {
      clearTimeout(decayTimer);
    }
  });

  return velocity;
}
