import { EventTypeName, IdleTimerOptions, IdleTimer } from "./types.js";
import { batch, createSignal, onMount, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";

const THROTTLE_DELAY: number = 250;
const FIFTEEN_MINUTES: number = 900_000; // 15 minutes
/**
 *  @constant
 *  @default
 */
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
 * @typedef {Object} IdleTimer
 * @method isIdle - Shows when the user is idle.
 * @method isPrompted - Tells whether onPrompt has been called or not, and consequently if the promptTimeout countdown has started
 * @method reset - Resets timers, doesn't trigger onActive
 * @method start - Adds listeners and starts timers, doesn't trigger onActive
 * @method stop - Removes listeners and cleans up the timers, doesn't trigger onActive.
 * @method triggerIdle - Set the idle status to idle and trigger the onIdle callback. Doesn't trigger onActive or onPrompt.
 */

/**
 * A primitive to observe the user's idle state and react to its changes.
 * @param {Object} [params={}] {@link IdleTimerOptions} - An options object to initialize the timer.
 * @param {string[]} [params.events=['mousemove', 'keydown', 'wheel', 'resize', 'mousedown', 'pointerdown', 'touchstart', 'touchmove', 'visibilitychange']] {@link EventTypeName}  - The DOM events that will be listened to in order to monitor the user's activity.
 * @param {number} [params.idleTimeout=900000] - Time of user's inactivity in milliseconds before the idle status changes to idle. This time is extended by the promptTimeout option.
 * @param {number} [params.promptTimeout=0] - To meet the typical use case when we want to prompt the user to check if they are still active, an additional timer starts running right after the idleTimeout expires. In this time slot, the user is in the prompt phase, whose duration is decided by promptTimeout. onActive is not fired in this phase, which cn only be interrupted by the methods {@link IdleTimer.reset}, {@link IdleTimer.stop}, {@link IdleTimer.pause}, {@link IdleTimer.triggerIdle}.
 * @param {function(Event): void} [params.onActive=() => {}] - Callback called when the user resumes activity after having been idle (resuming from prompt phase doesn't trigger `onActive`). The event that triggered the return to activity is passed as a parameter.
 * @param {function(Event): void} [params.onIdle=() => {}] - Callback triggered when the user status passes to idle. When invoked, the last event fired before the prompt phase will be passed as a parameter. Events fired in the prompt phase will not count.
 * @param {function(Event): void} [params.onPrompt=() => {}] - When the idleTimeout timer expires, before declaring the idle status, onPrompt callback is fired, starting the prompt timer. When invoked, the last event fired before the prompt phase will be passed as a parameter.
 * @param {HTMLElement} [params.element=document] - DOM element to which the event listeners will be attached.
 * @param {boolean} [params.startManually=false] - Requires the event-listeners to be bound manually by using the start method (see {@link IdleTimer}), instead of on mount.
 * @returns {IdleTimer} - The instance of the idle timer. It contains the following accessors and methods:
 *    - isIdle: Accessor<boolean>; shows when the user is idle
 *    - isPrompted: Accessor<boolean>; tells whether params.onPrompt has been called or not, and consequently if the promptTimeout countdown has started
 *    - reset: () => void; resets timers, doesn't trigger onActive
 *    - start: () => void; adds listeners and starts timers, doesn't trigger onActive
 *    - stop: () => void; removes listeners and cleans up the timers, doesn't trigger onActive
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
}: IdleTimerOptions = {}): IdleTimer => {
  if (isServer) {
    return {
      isIdle: () => false,
      isPrompted: () => false,
      reset: () => {},
      start: () => {},
      stop: () => {},
      triggerIdle: () => {},
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

  function triggerIdle() {
    stopListening();
    setIsIdle(true);
    onIdle?.(new CustomEvent("manualidle"));
    addListeners();
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
    triggerIdle,
  };
};
