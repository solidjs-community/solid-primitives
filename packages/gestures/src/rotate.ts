import { onCleanup } from "solid-js";
import { registerPointerListener, getCenterOfTwoPoints } from "./core.ts";

export type RotateProps = {
  callback: (rotation: number, center: { x: number; y: number }) => void;
};

function getPointersAngleDeg(activeEvents: PointerEvent[]) {
  // object mapping avoids a nest of conditionals for quadrant detection
  const quadrantsMap = {
    left: { top: 360, bottom: 180 },
    right: { top: 0, bottom: 180 },
  };

  const width = activeEvents[1]!.clientX - activeEvents[0]!.clientX;
  const height = activeEvents[0]!.clientY - activeEvents[1]!.clientY;

  /*
  In quadrants 1 and 3 all works as expected.
  In quadrants 2 and 4, either height or width is negative,
  so we get a negative angle. It is the other of the two angles.
  As the sum in a triangle is 180 deg, we sum the negative angle with 90 deg
  and get the right angle's positive value. Then add 90 for each quadrant above 1st.
  This avoids needing arc cotangent (not available in JS).
  */

  const angle = Math.atan(width / height) / (Math.PI / 180);

  const halfQuadrant = width > 0 ? quadrantsMap.right : quadrantsMap.left;
  const quadrantAngleBonus = height > 0 ? halfQuadrant.top : halfQuadrant.bottom;

  return angle + quadrantAngleBonus;
}

export function rotate(props: RotateProps): (node: HTMLElement) => void {
  let cleanup: (() => void) | undefined;
  onCleanup(() => cleanup?.());

  return (node: HTMLElement) => {
    let prevAngle: number | undefined;
    let initAngle = 0;
    let rotationCenter: { x: number; y: number } = { x: 0, y: 0 };

    function onUp(activeEvents: PointerEvent[]) {
      if (activeEvents.length === 1) {
        prevAngle = undefined;
      }
    }

    function onDown(activeEvents: PointerEvent[]) {
      if (activeEvents.length === 2) {
        activeEvents = activeEvents.sort((a, b) => {
          return a.clientX - b.clientX;
        });

        rotationCenter = getCenterOfTwoPoints(node, activeEvents);
        initAngle = getPointersAngleDeg(activeEvents);
      }
    }

    function onMove(activeEvents: PointerEvent[]) {
      if (activeEvents.length === 2) {
        const curAngle = getPointersAngleDeg(activeEvents);

        if (prevAngle !== undefined && curAngle !== prevAngle) {
          // normalize to zero at start; clamp to [-180, 180]
          let rotation = curAngle - initAngle;
          if (rotation > 180) rotation -= 360;
          else if (rotation < -180) rotation += 360;

          props.callback(rotation, rotationCenter);
        }
        prevAngle = curAngle;
      }
    }

    cleanup = registerPointerListener(node, onDown, onMove, onUp);
  };
}
