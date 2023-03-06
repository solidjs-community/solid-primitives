import { EventTypeName, IdleTimerOptions, IdleTimerReturn } from "./types";
import { batch, createSignal, onMount, onCleanup } from "solid-js";

const THROTTLE_DELAY: number = 250;
const FIFTEEN_MINUTES: number = 900_000; // 15 minutes
const EVENTS: EventTypeName[] = [
  "mousemove",
  "keydown",
  "wheel",
  "resize",
  "wheel",
  "mousedown",
  "pointerdown",
  "touchstart",
  "touchmove",
  "visibilitychange",
];
/**
 * A primitive to observe the user's idle state and react to its changes.
 * @param - an objects that takes several variables and callbacks, all of them optionals
 * {
 *    @param params.events: EventTypeName[]`; a list of the DOM events that will be listened to in order to monitor the user's activity. The events must be of `ventTypeName type (that can be imported). It defaults to the events in the EVENTS constant.
 *    @param params.idleTimeout: number; time of user's inactivity in milliseconds before the idle status changes to idle. This time is extended by the promptTimeout option. It defaults to 15 minutes.
 *    @param params.promptTimeout: number; to meet the typical usecase when we want to prompt the user to check if we they are still active, an additional timer starts running right after the idleTimeout expires. In this time slot, the user is in the prompt phase, whose duration is decided by promptTimout. It defaults to 0.
 *    @param params.onActive: (evt: Event) => void; callback called when the user resumes activity after having been idle (resuming from prompt phase doesn't trigger `onActive`). The event that triggered the return to activity is passed as a parameter. It defaults to an empty function.
 *    @param params.onIdle: (evt: Event) => void; callback triggered when the user status passes to idle. When invoked, the last event fired before the prompt phase will be passed as parameter. Events fired in the prompt phase will not count. It defaults to an empty function.
 *    @param params.onPrompt: (evt: Event) => void; when the idleTimeout timer expires, before declaring the idle status, onPrompt callback is fired, starting the prompt timer. When invoked, the last event fired before the prompt phase will be passed as a parameter. It defaults to an empty function.
 *    @param params.element: HTMLElement; DOM element to which the event listeners will be attached. It defaults to document.
 *    @param params.startsManually: boolean; requires the event-listeners to be bound manually by using the start method (see @returns), instead of on mount. It defaults to false.
 * }
 * @returns - returns an object with several methods and accessors
 * {
 *    @returns.isIdle: Accessor<boolean>; shows when the user is idle
 *    @returns.isPrompted: Accessor<boolean>; tells whether params.onPrompt has been called or not, and consequently if the promptTimeout countdown has started
 *    @returns.reset: () => void; resets timers, doesn't trigger onActive.
 *    @returns.start: () => void; adds listeners and starts timers, doesn't trigger onActive.
 *    @returns.stop: () => void; removes listeners and cleans up the timers, doesn't trigger onActive.
 * }
 */
export const createIdleTimer = ({
  element,
  events = EVENTS,
  idleTimeout = FIFTEEN_MINUTES,
  promptTimeout = 0,
  onActive,
  onIdle,
  onPrompt,
  startManually = false,
}: IdleTimerOptions = {}): IdleTimerReturn => {
  if (process.env.SSR) {
    return {
      isIdle: () => false,
      isPrompted: () => false,
      reset: () => {},
      start: () => {},
      stop: () => {},
    };
  }
  let listenersAreOn = false;
  const [isPrompted, setIsPrompted] = createSignal(false);
  const [isIdle, setIsIdle] = createSignal(false);

  let idle: ReturnType<typeof setTimeout>;
  let prompt: ReturnType<typeof setTimeout>;
  let lastThrottle: number = 0;

  function shouldPreventRunning() {
    const now = new Date().getTime();
    const shouldPrevent = now - lastThrottle < THROTTLE_DELAY;
    if (!shouldPrevent) lastThrottle = now;

    return shouldPrevent;
  }

  function handleEvent(evt: Event) {
    if (shouldPreventRunning()) return;
    if (isIdle()) onActive?.(evt);
    if (!isPrompted()) timerReset(evt);
  }

  function addListeners() {
    if (listenersAreOn) return;
    const target = element ?? document;

    for (const evt of events) {
      target.addEventListener(evt, handleEvent);
    }

    listenersAreOn = true;
  }

  function timerReset(evt: Event) {
    if (!listenersAreOn) return;

    timerCleanup();
    cleanState();
    setIdleTimer(evt);
  }

  function timerCleanup() {
    if (typeof idle === "number") clearTimeout(idle);
    if (typeof prompt === "number") clearTimeout(prompt);
  }

  function setIdleTimer(evt: Event) {
    idle = setTimeout(() => {
      setIsPrompted(true);
      onPrompt?.(evt);
      setPromptTimer(evt);
    }, idleTimeout);
  }

  function setPromptTimer(evt: Event) {
    prompt = setTimeout(() => {
      batch(() => {
        setIsIdle(true);
        setIsPrompted(false);
      });
      onIdle?.(evt);
    }, promptTimeout);
  }

  function cleanState() {
    batch(() => {
      setIsIdle(false);
      setIsPrompted(false);
    });
  }

  function startListening(evt: Event = new CustomEvent("manualstart")) {
    timerCleanup();
    cleanState();
    addListeners();
    timerReset(evt);
  }

  function stopListening() {
    timerCleanup();
    cleanState();
    removeListeners();
  }

  function removeListeners() {
    if (!listenersAreOn) return;

    const target = element ?? document;

    for (const evt of events) {
      target.removeEventListener(evt, handleEvent);
    }

    listenersAreOn = false;
  }

  onMount(() => {
    if (startManually) return;
    startListening(new CustomEvent("mount"));
  });

  onCleanup(stopListening);

  return {
    isIdle,
    isPrompted,
    start: () => startListening(),
    reset: () => timerReset(new CustomEvent("manualreset")),
    stop: stopListening,
  };
};
