import { Accessor } from "solid-js";

export type EventTypeName = keyof HTMLElementEventMap | keyof DocumentEventMap;

/**
 * An option object to initialize the timer.
 */
export interface IdleTimerOptions {
  /**
   * The DOM events that will be listened to in order to monitor the user's activity.
   * @default ['mousemove', 'keydown', 'wheel', 'resize', 'mousedown', 'pointerdown', 'touchstart', 'touchmove', 'visibilitychange']
   */
  events?: EventTypeName[];
  /**
   * DOM element to which the event listeners will be attached.
   * @default document
   */
  element?: HTMLElement;
  /**
   * Time of user's inactivity in milliseconds before the idle status changes to idle. 
   * This time is extended by the promptTimeout option.
   * @default 900000 (15 minutes)
   */
  idleTimeout?: number;
  /**
   * To meet the typical use case when we want to prompt the user to check if they are still active, an additional timer starts running right after the idleTimeout expires. 
   * In this time slot, the user is in the prompt phase, whose duration is decided by promptTimeout.
   * onActive is not fired in this phase, which cn only be interrupted by the methods reset, stop, pause, triggerIdle.
   * @default 0
  */
  promptTimeout?: number;
  /**
   * Requires the event-listeners to be bound manually by using the start method, instead of on mount.
   * @default false
   */
  startManually?: boolean;
  /**
   * Callback triggered when the user status passes to idle. When invoked, the last event fired before the prompt phase will be passed as a parameter.
   * @param {Event} lastEvt - the last event fired before the prompt phase. Events fired in the prompt phase will not count.
   * @returns {void}
   * @default () => {}
   */
  onIdle?: (lastEvt: Event) => void;
  /**
   * Callback called when the user resumes activity after having been idle (resuming from prompt phase doesn't trigger `onActive`).
   * @param {Event} activyEvt - the last event fired before the prompt phase.
   * @returns {void}
   * @default () => {}
   */
  onActive?: (activyEvt: Event) => void;
  /**
   * Callback triggered when the idleTimeout timer expires, before declaring the idle status, onPrompt callback is fired, starting the prompt timer.
   * @param {Event} promptEvt - the last event fired before the prompt phase.
   * @returns {void}
   * @default () => {}
   */
  onPrompt?: (promptEvt: Event) => void;
}

/**
 * The instance of the idle timer
 */
export interface IdleTimer {
  /**
   * Shows when the user is idle
   */
  isIdle: Accessor<boolean>;
  /**
   * Tells whether onPrompt has been called or not, and consequently if the promptTimeout countdown has started
   */
  isPrompted: Accessor<boolean>;
  /**
   * Resets timers, doesn't trigger onActive
   */
  reset: () => void;
  /**
   * Adds listeners and starts timers, doesn't trigger onActive
   */
  start: () => void;
  /**
   * Removes listeners and cleans up the timers, doesn't trigger onActive.
   */
  stop: () => void;
  /**
   * Set the idle status to idle and trigger the onIdle callback. Doesn't trigger onActive or onPrompt.
   */
  triggerIdle: () => void;
}

/**
 * @deprecated 
 * IdleTimerReturn has been renamed to IdleTimer for clarity and coherence. 
 * Please use IdleTimer instead.
 */
export type IdleTimerReturn = IdleTimer;
