import { Accessor, onMount, onCleanup, createEffect } from "solid-js";
import { isServer } from "solid-js/web";
import { access, noop } from "@solid-primitives/utils";
import { createStaticStore } from "@solid-primitives/static-store";

// Set of control enums
export enum AudioState {
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  COMPLETE = "complete",
  STOPPED = "stopped",
  READY = "ready",
  ERROR = "error",
}

export type AudioSource =
  | string
  | undefined
  | HTMLAudioElement
  | MediaSource
  | (string & MediaSource);

export type AudioEventHandlers = {
  [K in keyof HTMLMediaElementEventMap]?: (event: HTMLMediaElementEventMap[K]) => void;
};

// Helper for producing the audio source
const unwrapSource = (src: AudioSource) => {
  if (src instanceof HTMLAudioElement) {
    return src
  }
  const player = new Audio();
  setAudioSrc(player, src)
  return player
};

function setAudioSrc(el: HTMLAudioElement, src: AudioSource) {
  el[typeof src === "string" ? "src" : "srcObject"] = src as string & MediaSource;
}

/**
 * Generates a basic audio instance with limited functionality.
 *
 * @param src Audio file path or MediaSource to be played
 * @param handlers An array of handlers to bind against the player
 * @return A basic audio player instance
 */
export const makeAudio = (
  src: AudioSource,
  handlers: AudioEventHandlers = {},
): HTMLAudioElement => {
  if (isServer) {
    return {} as HTMLAudioElement;
  }

  const player = unwrapSource(src);

  onMount(() => {
    for (const [name, handler] of Object.entries(handlers)) {
      player.addEventListener(name, handler as any)
    }
  });
  onCleanup(() => {
    player.pause();
    for (const [name, handler] of Object.entries(handlers)) {
      player.removeEventListener(name, handler as any)
    }
  })

  return player;
};

/**
 * Generates a basic audio player with simple control mechanisms.
 *
 * @param src Audio file path or MediaSource to be played
 * @return options - @type Object
 * @return options.start - Start playing
 * @return options.pause - Pause playing
 * @return options.seek - Seeks to a location in the playhead
 * @return options.setVolume - Sets the volume of the player
 * @return options.player - Raw player instance
 * @return Returns a location signal and one-off async query callback
 *
 * @example
 * ```ts
 * const { start, seek } = makeAudioPlayer('./example1.mp3');
 * ```
 */
export const makeAudioPlayer = (
  src: AudioSource,
  handlers: AudioEventHandlers = {},
): {
  play: () => Promise<void>;
  pause: VoidFunction;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  player: HTMLAudioElement;
} => {
  if (isServer) {
    return {
      pause: noop,
      play: async () => noop(),
      player: {} as HTMLAudioElement,
      seek: noop,
      setVolume: noop,
    };
  }
  const player = makeAudio(src, handlers);
  return {
    player,
    play: () => player.play(),
    pause: () => player.pause(),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    seek: player.fastSeek
      ? (time: number) => player.fastSeek(time)
      : (time: number) => (player.currentTime = time),
    setVolume: (volume: number) => (player.volume = volume),
  };
};

/**
 * A reactive audio primitive with basic control actions.
 *
 * @param src Audio source path or MediaSource to be played or an accessor
 * @param playing A signal for controlling the player
 * @param volume A signal for controlling the volume
 * @return [store] - @type Store
 * @return [store.state] - Current state of the player
 * @return [store.currentTime] - Current time of the playhead
 * @return [store.duration] - Duration of the loaded file
 * @return [store.volume] - Current volume of the audio player
 * @return [store.player] - Raw player instance
 * @return [controls] - Controls for the audio player @type Object
 * @return [controls.seek] - Seeks to a specified location
 * @return [controls.play] - Start playing
 * @return [controls.pause] - Pause playing
 * @return [controls.setVolume] - Sets the volume of the player, from 0 to 1
 *
 *
 * @example
 * ```ts
 * const [playing, setPlaying] = createSignal(false);
 * const [volume, setVolume] = createSignal(1);
 * const [audio, controls] = createAudio('./example1.mp3', playing, volume);
 * console.log(audio.duration);
 * ```
 */
export const createAudio = (
  src: AudioSource | Accessor<AudioSource>,
  playing?: Accessor<boolean>,
  volume?: Accessor<number>,
): [
  {
    state: AudioState;
    currentTime: number;
    duration: number;
    volume: number;
    player: HTMLAudioElement;
  },
  {
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    play: () => Promise<void>;
    pause: VoidFunction;
  },
] => {
  if (isServer) {
    return [
      {
        state: AudioState.LOADING,
        currentTime: 0,
        duration: 0,
        volume: 0,
        player: {} as HTMLAudioElement,
      },
      {
        seek: noop,
        setVolume: noop,
        play: async () => noop(),
        pause: noop,
      },
    ];
  }

  const player = unwrapSource(access(src));

  const [store, setStore] = createStaticStore({
    state: AudioState.LOADING,
    player,
    currentTime: 0,
    duration: 0,
    volume: 0,
  });

  const { play, pause, setVolume: _setVolume, seek } = makeAudioPlayer(store.player, {
    loadeddata: () => {
      setStore({
        state: AudioState.READY,
        duration: player.duration,
      });
      if (playing && playing()) {
        play().catch((e: DOMException) => {
          if (e.name === "NotAllowedError") {
            setStore("state", AudioState.ERROR);
          }
        });
      }
    },
    timeupdate: () => setStore("currentTime", player.currentTime),
    loadstart: () => setStore("state", AudioState.LOADING),
    playing: () => setStore("state", AudioState.PLAYING),
    pause: () => setStore("state", AudioState.PAUSED),
    error: () => setStore("state", AudioState.ERROR),
    ended: () => setStore("state", AudioState.COMPLETE),
  });

  const setVolume = (volume: number) => {
    setStore("volume", volume)
    _setVolume(volume)
  }

  // Bind reactive properties as needed
  if (src instanceof Function) {
    createEffect(() => {
      const newSrc = src();
      if (newSrc instanceof HTMLAudioElement) {
        setStore("player", newSrc);
      } else {
        setAudioSrc(store.player, newSrc)
      }
      seek(0);
    });
  }

  if (playing) {
    createEffect(() => (playing() ? play() : pause()));
  }
  if (volume) {
    createEffect(() => setVolume(volume()));
    setVolume(volume());
  }

  return [store, { seek, play, pause, setVolume }];
};
