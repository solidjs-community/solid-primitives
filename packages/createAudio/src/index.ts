import { createSignal, batch, onMount, onCleanup, createEffect } from 'solid-js';

const AudioState = Object.freeze({
  LOADING: Symbol("loading"),
  PLAYING: Symbol("playing"),
  PAUSED: Symbol("paused"),
  COMPLETE: Symbol("complete"),
  STOPPED: Symbol("stopped"),
  READY: Symbol("ready"),
});

/**
 * Creates a simple audio manager with most control actions.
 * 
 * @param path URL to the audio file that is to be played
 * @param volume Volume setting for the audio file
 * @return options - @type Object
 * @return options.start - Start playing
 * @return options.stop - Stop playing
 * @return options.currentTime - Current time that the player is at
 * @return options.state - Current state of the player as a Symbol
 * @return options.duration - Duration of the audio clip
 * @return options.seek - A function to support seeking
 * @return options.setVolume - A function to change the volume setting
 * @return Returns a location signal and one-off async query callback
 * 
 * @example
 * ```ts
 * const [start, pause, seek] = createAudio('./example1.mp3);
 * ```
 */
 const createAudio = (path: string | (() => string), volume: number = 1) => {
  let player: HTMLAudioElement = new Audio();
  const [currentTime, setCurrentTime] = createSignal<number>(0);
  const [duration, setDuration] = createSignal<number>(0);
  const [state, setState] = createSignal<symbol>(AudioState.LOADING);

  // Audio controls
  const play = () => player.play();
  const pause = () => player.pause();
  const seek = (time: number) => player.fastSeek(time);
  const setVolume = (volume: number) => (player.volume = volume);

  // Handle events from the player
  const handleLoaded = () =>
    batch(() => {
      setState(AudioState.READY);
      setDuration(player.duration);
    });
  const handleTime = () =>
    batch(() => {
      setState(AudioState.PLAYING);
      setCurrentTime(player.currentTime);
    });

  // Handle option changes separtely
  createEffect(() => {
    if (typeof path === "function" && path()) {
      player.src = path();
    } else {
      player.src = path as string;
    }
  });
  createEffect(() => (player.volume = volume));

  // Bind recording events to the player
  const handlers: Array<[string, EventListener]> = [
    ["loadeddata", handleLoaded],
    ["loadstart", () => setState(AudioState.LOADING)],
    ["playing", () => setState(AudioState.PLAYING)],
    ["pause", () => setState(AudioState.PAUSED)],
    ["timeupdate", handleTime]
  ];
  onMount(() =>
    handlers.forEach(([evt, handler]) => player.addEventListener(evt, handler))
  );
  onCleanup(() =>
    handlers.forEach(([evt, handler]) =>
      player.removeEventListener(evt, handler)
    )
  );
  return { play, pause, currentTime, state, duration, seek, setVolume };
};

export default createAudio;
