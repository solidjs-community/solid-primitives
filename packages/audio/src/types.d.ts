// Set of control enums
declare enum AudioState {
  LOADING = "loading",
  PLAYING = "playing",
  PAUSED = "paused",
  COMPLETE = "complete",
  STOPPED = "stopped",
  READY = "ready"
}

declare type AudioSource =
  | string
  | MediaSource
  | (string & MediaSource)
  | (() => string | MediaSource | (string & MediaSource));
