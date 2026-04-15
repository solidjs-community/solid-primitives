import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";
import { isServer } from "@solidjs/web";
import { access, noop } from "@solid-primitives/utils";

export type AudioSource = string | undefined | MediaProvider;

export type AudioEventHandlers = {
  [K in keyof HTMLMediaElementEventMap]?: (event: HTMLMediaElementEventMap[K]) => void;
};

export type AudioControls = {
  play: () => Promise<void>;
  pause: VoidFunction;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  player: HTMLAudioElement;
};

export type AudioReturn = {
  player: HTMLAudioElement;
  playing: Accessor<boolean>;
  setPlaying: (v: boolean) => void;
  volume: Accessor<number>;
  setVolume: (v: number) => void;
  currentTime: Accessor<number>;
  duration: Accessor<number>;
  seek: (time: number) => void;
};

function setAudioSrc(el: HTMLAudioElement, src: AudioSource) {
  if (typeof src === "string") {
    el.src = src;
  } else {
    el.srcObject = src as MediaProvider | null;
  }
}

const unwrapSource = (src: AudioSource | HTMLAudioElement) => {
  if (src instanceof HTMLAudioElement) return src;
  const player = new Audio();
  setAudioSrc(player, src);
  return player;
};

/**
 * Generates a basic audio instance with limited functionality.
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * @param src Audio file path, MediaProvider, or existing HTMLAudioElement
 * @param handlers Event handlers to bind against the player
 * @returns Tuple of `[player, cleanup]`
 *
 * @example
 * ```ts
 * const [player, cleanup] = makeAudio('./example1.mp3');
 * ```
 */
export const makeAudio = (
  src: AudioSource | HTMLAudioElement,
  handlers: AudioEventHandlers = {},
): [player: HTMLAudioElement, cleanup: VoidFunction] => {
  if (isServer) return [{} as HTMLAudioElement, noop];

  const player = unwrapSource(src);

  for (const [name, handler] of Object.entries(handlers)) {
    player.addEventListener(name, handler as EventListener);
  }

  const cleanup = () => {
    player.pause();
    for (const [name, handler] of Object.entries(handlers)) {
      player.removeEventListener(name, handler as EventListener);
    }
  };

  return [player, cleanup];
};

/**
 * Generates a basic audio player with simple control mechanisms.
 * Non-reactive — no Solid owner required. Returns a cleanup function.
 *
 * @param src Audio file path, MediaProvider, or existing HTMLAudioElement
 * @param handlers Event handlers to bind against the player
 * @returns Tuple of `[controls, cleanup]`
 *
 * @example
 * ```ts
 * const [{ play, seek }, cleanup] = makeAudioPlayer('./example1.mp3');
 * ```
 */
export const makeAudioPlayer = (
  src: AudioSource | HTMLAudioElement,
  handlers: AudioEventHandlers = {},
): [controls: AudioControls, cleanup: VoidFunction] => {
  if (isServer) {
    return [
      {
        play: async () => noop(),
        pause: noop,
        seek: noop,
        setVolume: noop,
        player: {} as HTMLAudioElement,
      },
      noop,
    ];
  }

  const [player, cleanup] = makeAudio(src, handlers);

  const controls: AudioControls = {
    player,
    play: () => player.play(),
    pause: () => player.pause(),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    seek: player.fastSeek
      ? (time: number) => player.fastSeek(time)
      : (time: number) => (player.currentTime = time),
    setVolume: (volume: number) => (player.volume = volume),
  };

  return [controls, cleanup];
};

/**
 * A reactive audio primitive.
 *
 * Returns a flat object with writable derived signals for `playing` and `volume`,
 * a reactive `currentTime`, and an async `duration` that suspends until the audio
 * is loaded (integrates with `<Suspense>` / `<Loading>`).
 *
 * @param src Audio file path, MediaProvider, or a reactive accessor returning either
 *
 * @example
 * ```ts
 * const audio = createAudio('./example1.mp3');
 * // or reactive source:
 * const audio = createAudio(() => trackUrl());
 *
 * audio.playing()        // boolean
 * audio.setPlaying(true) // plays
 * audio.volume()         // 0–1
 * audio.setVolume(0.5)
 * audio.duration()       // suspends until loaded
 * audio.currentTime()
 * audio.seek(30)
 * ```
 */
export const createAudio = (src: AudioSource | Accessor<AudioSource>): AudioReturn => {
  if (isServer) {
    return {
      player: {} as HTMLAudioElement,
      playing: () => false,
      volume: () => 1,
      currentTime: () => 0,
      duration: () => 0,
      setPlaying: noop,
      setVolume: noop,
      seek: noop,
    };
  }

  const player = unwrapSource(access(src));

  const [controls, cleanup] = makeAudioPlayer(player);
  onCleanup(cleanup);

  // currentTime — updated on timeupdate
  const [currentTime, setCurrentTime] = createSignal(0);
  player.addEventListener("timeupdate", () => setCurrentTime(player.currentTime));

  // playing — writable derived signal; DOM events keep it in sync
  const [playing, setPlayingSignal] = createSignal(!player.paused);
  player.addEventListener("playing", () => setPlayingSignal(true));
  player.addEventListener("pause", () => setPlayingSignal(false));
  player.addEventListener("ended", () => setPlayingSignal(false));
  const setPlaying = (v: boolean) => (v ? controls.play() : controls.pause());

  // volume — writable derived signal; volumechange event keeps it in sync
  const [volume, setVolumeSignal] = createSignal(player.volume);
  player.addEventListener("volumechange", () => setVolumeSignal(player.volume));
  const setVolume = (v: number) => (player.volume = v);

  // duration — signal updated when audio loads; NaN until loadeddata fires or when src changes
  const [duration, setDuration] = createSignal<number>(player.duration);
  player.addEventListener("loadeddata", () => setDuration(player.duration));
  player.addEventListener("loadstart", () => setDuration(NaN));

  // Reactive src — update player source when signal changes
  if (src instanceof Function) {
    createEffect(src, (newSrc: AudioSource) => {
      setAudioSrc(player, newSrc);
      controls.seek(0);
    });
  }

  return {
    player,
    playing,
    setPlaying,
    volume,
    setVolume,
    currentTime,
    duration,
    seek: controls.seek,
  };
};
