export type {
  VideoSource,
  VideoEventHandlers,
  VideoOptions,
  VideoControlsOptions,
  VideoControls,
  VideoReturn,
  VideoControlsReturn,
} from "./types.ts";

export { makeVideo, setVideoSrc, createVideo } from "./createVideo.ts";
export { makeVideoPlayer, createVideoPlayer } from "./createVideoPlayer.ts";
export { makeVideoFrameCallback, createVideoFrameCallback } from "./createVideoFrameCallback.ts";
