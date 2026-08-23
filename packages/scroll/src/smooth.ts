import { createSignal, onCleanup, type Accessor } from "solid-js";
import { isServer } from "solid-js/web";
import { type Position, getScrollPosition } from "./index.js";

export interface SmoothScrollOptions {
  damping?: number;
  stiffness?: number;
  precision?: number;
}

export interface SmoothScrollReturn {
  x: Accessor<number>;
  y: Accessor<number>;
  velocityX: Accessor<number>;
  velocityY: Accessor<number>;
  isScrolling: Accessor<boolean>;
  scrollTo: (target: Partial<Position>) => void;
  stop: () => void;
}

export function createSmoothScroll(
  elementOrWindow?: Element | Window | null | (() => Element | Window | null),
  options: SmoothScrollOptions = {},
): SmoothScrollReturn {
  if (isServer || typeof window === "undefined") {
    return {
      x: () => 0,
      y: () => 0,
      velocityX: () => 0,
      velocityY: () => 0,
      isScrolling: () => false,
      scrollTo: () => {},
      stop: () => {},
    };
  }

  const damping = options.damping ?? 0.85;
  const precision = options.precision ?? 0.5;

  const getTarget = (): Element | Window => {
    if (typeof elementOrWindow === "function") {
      return elementOrWindow() ?? window;
    }
    return elementOrWindow ?? window;
  };

  const initial = getScrollPosition(getTarget());
  const [posX, setPosX] = createSignal(initial.x);
  const [posY, setPosY] = createSignal(initial.y);
  const [velX, setVelX] = createSignal(0);
  const [velY, setVelY] = createSignal(0);
  const [isScrolling, setIsScrolling] = createSignal(false);

  let targetX = initial.x;
  let targetY = initial.y;
  let currentX = initial.x;
  let currentY = initial.y;
  let currentVelX = 0;
  let currentVelY = 0;
  let rafId: number | null = null;

  const tick = (): void => {
    const dx = targetX - currentX;
    const dy = targetY - currentY;

    currentVelX = (currentVelX + dx * 0.1) * damping;
    currentVelY = (currentVelY + dy * 0.1) * damping;

    currentX += currentVelX;
    currentY += currentVelY;

    const target = getTarget();
    if (target instanceof Window) {
      target.scrollTo(currentX, currentY);
    } else {
      target.scrollLeft = currentX;
      target.scrollTop = currentY;
    }

    setPosX(currentX);
    setPosY(currentY);
    setVelX(currentVelX);
    setVelY(currentVelY);

    if (
      Math.abs(dx) < precision &&
      Math.abs(dy) < precision &&
      Math.abs(currentVelX) < 0.1 &&
      Math.abs(currentVelY) < 0.1
    ) {
      currentX = targetX;
      currentY = targetY;
      if (target instanceof Window) {
        target.scrollTo(targetX, targetY);
      } else {
        target.scrollLeft = targetX;
        target.scrollTop = targetY;
      }
      setPosX(targetX);
      setPosY(targetY);
      setVelX(0);
      setVelY(0);
      setIsScrolling(false);
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  const scrollTo = (dest: Partial<Position>): void => {
    const target = getTarget();
    const cur = getScrollPosition(target);
    currentX = cur.x;
    currentY = cur.y;

    if (dest.x !== undefined) targetX = dest.x;
    if (dest.y !== undefined) targetY = dest.y;

    if (!isScrolling()) {
      setIsScrolling(true);
      rafId = requestAnimationFrame(tick);
    }
  };

  const stop = (): void => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    setIsScrolling(false);
    setVelX(0);
    setVelY(0);
  };

  onCleanup(stop);

  return {
    x: posX,
    y: posY,
    velocityX: velX,
    velocityY: velY,
    isScrolling,
    scrollTo,
    stop,
  };
}
