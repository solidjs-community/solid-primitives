import { EventTypeName, IdleTimerOptions, IdleTimerReturn } from './types';
import { createSignal, onMount, onCleanup } from 'solid-js';

const THROTTLE_DELAY: number = 250;
const TEN_MINUTES: number = 600_000; // 10 minutes
const EVENTS: EventTypeName[] = [
  'mousemove',
  'keydown',
  'wheel',
  'mousewheel',
  'mousedown',
  'pointerdown',
  'touchstart',
  'touchmove',
  'visibilitychange',
];
/**
 * A primiive to observe the user's idle state and react to its changes.
 * @param - an objects that takes several variables and callbacks, all of them optionals
 * {
 *    @param params.events: EventTypeName[], a list of events that trigger the reset of the idle timers; defaults to the events in the EVENTS constant.
 *    @param params.idleTimeout: number, the inactivity time (in milliseconds) since last interaction after which user is prompted, or declared idle if there's no promptTimeout; defaults to 10 minutes.
 *    @param params.promptTimeout: number, prompt duration before declaring the user idle; defaults to zero.
 *    @param params.onActive: Function, callback fired when the user resumes activity after being idle. Takes the event that triggered activity as argument.
 *    @param params.onIdle: Function, callback fired when the user entetrs the idle phase. Takes the last activity event as argument.
 *    @param params.onPrompt: Function, callback fired when the idle timer expires. Takes the last activity event as argument.
 *    @param params.element: HTMLElement, DOM element to which the event listeners will be attached; it defaults to document.
 *    @param params.startsOnMount: boolean, reaquires the events listeners to be attached onMount (as opposed to manually, with the start method, see @returns); defaults to true.
 * }
 * @returns - returns an object with several methods and accessors
 * {
 *    @returns.isIdle: Accessor<boolean>, shows when the user is idle
 *    @returns.isPrompted: Accessor<boolean>, tells whether params.onPrompt has been called or not, and consequently if the promptTimeout countdown has started
 *    @returns.reset: Function, resets timers, doesn't trigger onActive.
 *    @returns.start: Function, adds listeners and starts timers, doesn't trigger onActive.
 *    @returns.stop: Function, removes listeners and cleans up the timers, doesn't trigger onActive.
 * }
 */
export const makeUserIdleTimer = ({
  element,
  events = EVENTS,
  idleTimeout = TEN_MINUTES,
  promptTimeout = 0,
  onActive,
  onIdle,
  onPrompt,
  startOnMount = true,
}: IdleTimerOptions): IdleTimerReturn => {
  const [listenersAreOn, setListenersAreOn] = createSignal(false);
  const [isPrompted, setIsPrompted] = createSignal(false);
  const [isIdle, setIsIdle] = createSignal(false);

  let sessionTimestamp = new Date().getTime()
  let idle: ReturnType<typeof setTimeout>;
  let prompt: ReturnType<typeof setTimeout>;
  let lastThrottle: number = 0;

  function getSessionTime() {
    return new Date().getTime() - sessionTimestamp
  }

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
    if (listenersAreOn()) return;
    const target = element ?? document;

    for (const evt of events) {
      target.addEventListener(evt, handleEvent);
    }

    setListenersAreOn(true);
  }

  function timerReset(evt: Event) {
    if (!listenersAreOn()) return;

    timerCleanup();
    cleanState();
    setIdleTimer(evt);
  }

  function timerCleanup() {
    if (typeof idle === 'number') clearTimeout(idle);
    if (typeof prompt === 'number') clearTimeout(prompt);
  }

  function setIdleTimer(evt: Event) {
    idle = setTimeout(() => {
      setIsPrompted(true)
      onPrompt?.(evt)
      setPromptTimer(evt)
    }, idleTimeout);
  }

  function setPromptTimer(evt: Event) {
    prompt = setTimeout(() => {
      setIsIdle(true);
      setIsPrompted(false)
      onIdle?.(evt);
    }, promptTimeout)
  }

  function cleanState() {
    if (isIdle()) setIsIdle(false);
    if (isPrompted()) setIsPrompted(false);
  }

  function startListening(evt: Event = new CustomEvent('manualstart')) {
    timerCleanup();
    cleanState();
    addListeners();
    timerReset(evt)
  }

  function stopListening() {
    timerCleanup();
    cleanState();
    removeListeners();
  }

  function removeListeners() {
    if (!listenersAreOn()) return;

    const target = element ?? document;

    for (const evt of events) {
      target.removeEventListener(evt, handleEvent);
    }

    setListenersAreOn(false);
  }

  onMount(() => {
    if (startOnMount) startListening(new CustomEvent('mount'))
  });

  onCleanup(stopListening);

  return {
    isIdle,
    isPrompted,
    getSessionTime,
    start: () => startListening(),
    reset: () => timerReset(new CustomEvent('manualreset')),
    stop: stopListening,
  };
};
