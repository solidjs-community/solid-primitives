declare enum AudioState {
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  COMPLETE = "complete",
  STOPPED = "stopped",
  READY = "ready",
  ERROR = "error"
}

type AudioSource = string | undefined | HTMLAudioElement | MediaSource | (string & MediaSource);

declare type AudioEventHandlers = {
  [K in keyof HTMLMediaElementEventMap]?: (event: HTMLMediaElementEventMap[K]) => void;
};
