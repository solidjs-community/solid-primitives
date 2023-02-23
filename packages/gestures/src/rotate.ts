import { registerPointerListener, getCenterOfTwoPoints } from "./core";

type Props = {
  callback: (rotation: number, center: { x: number; y: number }) => any;
};

declare module "solid-js" {
  namespace JSX {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      ["use:rotate"]?: Props;
    }
  }
}

function getPointersAngleDeg(activeEvents: PointerEvent[]) {
  // instead of hell lot of conditions we use an object mapping
  const quadrantsMap = {
    left: { top: 360, bottom: 180 },
    right: { top: 0, bottom: 180 }
  };

  const width = activeEvents[1]!.clientX - activeEvents[0]!.clientX;
  const height = activeEvents[0]!.clientY - activeEvents[1]!.clientY;

  /*
  In quadrants 1 and 3 allworks as expected. 
  In quadrants 2 and 4, either height or width is negative,
  so we get negative angle. It is even the other of the two angles.
  As sum in triangle is 180 deg, we can simply sum the negative angle with 90 deg
  and get the right angle's positive value. Then add 90 for each quadrant above 1st.
  This way we dont need to code our own arc cotangent fn (it does not exist in JS)
  */

  const angle = Math.atan(width / height) / (Math.PI / 180);

  const halfQuadrant = width > 0 ? quadrantsMap.right : quadrantsMap.left;
  const quadrantAngleBonus = height > 0 ? halfQuadrant.top : halfQuadrant.bottom;

  return angle + quadrantAngleBonus;
}

export function rotate(node: HTMLElement, props: () => Props) {
  let prevAngle: number | undefined;
  let initAngle = 0;
  let rotationCenter: { x: number; y: number };

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
        // Make sure we start at zero, doesnt matter what is the initial angle of fingers
        let rotation = curAngle - initAngle;

        // instead of showing 180 - 360, we will show negative -180 - 0
        if (rotation > 180) {
          rotation -= 360;
        }

        props().callback(rotation, rotationCenter);
      }
      prevAngle = curAngle;
    }
  }

  return registerPointerListener(node, onDown, onMove, onUp);
}
