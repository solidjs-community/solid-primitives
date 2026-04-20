import { type Accessor, createEffect, createSignal, NotReadyError, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
import { access, noop } from "@solid-primitives/utils";

// Sentinel for the "audio not yet loaded" pending state.
const NOT_SET: unique symbol = Symbol();

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
  /**
   * Throws `NotReadyError` until the audio metadata has loaded (integrates with
   * `<Loading>`). After the first `loadeddata` event, returns the duration in
   * seconds reactively. Resets to pending whenever the source changes.
   */
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
 * a reactive `currentTime`, and a `duration` that throws `NotReadyError` until the
 * audio metadata loads — integrating with `<Loading>` for a natural pending state.
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
 * audio.currentTime()
 * audio.seek(30)
 *
 * // duration() throws NotReadyError until metadata loads:
 * <Loading fallback={<p>Loading...</p>}>
 *   <p>{audio.duration()}s</p>
 * </Loading>
 * ```
 */
export const createAudio = (src: AudioSource | Accessor<AudioSource>): AudioReturn => {
  if (isServer) {
    return {
      player: {} as HTMLAudioElement,
      playing: () => false,
      volume: () => 1,
      currentTime: () => 0,
      duration: () => {
        throw new NotReadyError("Audio duration not available on the server");
      },
      setPlaying: noop,
      setVolume: noop,
      seek: noop,
    };
  }

  const player = unwrapSource(access(src));

  const [controls, cleanup] = makeAudioPlayer(player);
  onCleanup(cleanup);

  // currentTime — updated on timeupdate
  const [currentTime, setCurrentTime] = createSignal(0, { ownedWrite: true });
  player.addEventListener("timeupdate", () => setCurrentTime(player.currentTime));

  // playing — writable derived signal; DOM events keep it in sync
  const [playing, setPlayingSignal] = createSignal(!player.paused, { ownedWrite: true });
  player.addEventListener("playing", () => setPlayingSignal(true));
  player.addEventListener("pause", () => setPlayingSignal(false));
  player.addEventListener("ended", () => setPlayingSignal(false));
  const setPlaying = (v: boolean) => (v ? controls.play() : controls.pause());

  // volume — writable derived signal; volumechange event keeps it in sync
  const [volume, setVolumeSignal] = createSignal(player.volume, { ownedWrite: true });
  player.addEventListener("volumechange", () => setVolumeSignal(player.volume));
  const setVolume = (v: number) => (player.volume = v);

  // duration — NOT_SET until loadeddata fires; resets to NOT_SET on loadstart
  // (new source). Plain wrapper throws NotReadyError when pending — integrates
  // with <Loading> without the caching issues of createSignal(fn).
  const [rawDuration, setRawDuration] = createSignal<number | typeof NOT_SET>(NOT_SET, {
    ownedWrite: true,
  });
  player.addEventListener("loadeddata", () => setRawDuration(player.duration));
  player.addEventListener("loadstart", () => setRawDuration(NOT_SET));
  const duration = (): number => {
    const val = rawDuration();
    if (val === NOT_SET) throw new NotReadyError("Audio duration not yet available");
    return val;
  };

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
