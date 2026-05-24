declare global {
  interface HTMLVideoElement {
    _mock: VideoMock;
  }
}

interface VideoMock {
  paused: boolean;
  duration: number;
  volume: number;
  muted: boolean;
  playbackRate: number;
  readyState: number;
  videoWidth: number;
  videoHeight: number;
  _loaded: boolean;
  _load: (video: HTMLVideoElement) => void;
  _resetMock: (video: HTMLVideoElement) => void;
}

// Each HTMLVideoElement instance gets its own mock state lazily on first access.
// This prevents prototype-level mutations from leaking between tests.

const createMockState = (): VideoMock => ({
  paused: true,
  duration: NaN,
  volume: 1,
  muted: false,
  playbackRate: 1,
  readyState: 0,
  videoWidth: 0,
  videoHeight: 0,
  _loaded: false,
  _load(video: HTMLVideoElement) {
    // Update mock values before dispatching events so listeners read correct state.
    video._mock.duration = 120;
    video._mock.readyState = 4;
    video._mock.videoWidth = 1280;
    video._mock.videoHeight = 720;
    video._mock._loaded = true;
    video.dispatchEvent(new Event("loadedmetadata"));
    video.dispatchEvent(new Event("loadeddata"));
    video.dispatchEvent(new Event("canplaythrough"));
  },
  _resetMock(video: HTMLVideoElement) {
    const fresh = createMockState();
    Object.assign(video._mock, fresh);
  },
});

Object.defineProperty(global.HTMLVideoElement.prototype, "_mock", {
  get(this: HTMLVideoElement) {
    if (!Object.prototype.hasOwnProperty.call(this, "__video_mock__")) {
      Object.defineProperty(this, "__video_mock__", {
        value: createMockState(),
        writable: true,
        configurable: true,
      });
    }
    return (this as any).__video_mock__;
  },
  set(this: HTMLVideoElement, v: VideoMock) {
    Object.defineProperty(this, "__video_mock__", {
      value: v,
      writable: true,
      configurable: true,
    });
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "paused", {
  get(this: HTMLVideoElement) {
    return this._mock.paused;
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "duration", {
  get(this: HTMLVideoElement) {
    return this._mock.duration;
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "volume", {
  get(this: HTMLVideoElement) {
    return this._mock.volume;
  },
  set(this: HTMLVideoElement, value: number) {
    this._mock.volume = value;
    this.dispatchEvent(new Event("volumechange"));
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "muted", {
  get(this: HTMLVideoElement) {
    return this._mock.muted;
  },
  set(this: HTMLVideoElement, value: boolean) {
    this._mock.muted = value;
    this.dispatchEvent(new Event("volumechange"));
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "playbackRate", {
  get(this: HTMLVideoElement) {
    return this._mock.playbackRate;
  },
  set(this: HTMLVideoElement, value: number) {
    this._mock.playbackRate = value;
    this.dispatchEvent(new Event("ratechange"));
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "readyState", {
  get(this: HTMLVideoElement) {
    return this._mock.readyState;
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "videoWidth", {
  get(this: HTMLVideoElement) {
    return this._mock.videoWidth;
  },
  configurable: true,
});

Object.defineProperty(global.HTMLVideoElement.prototype, "videoHeight", {
  get(this: HTMLVideoElement) {
    return this._mock.videoHeight;
  },
  configurable: true,
});

global.HTMLVideoElement.prototype.play = async function playMock(this: HTMLVideoElement) {
  if (!this._mock._loaded) {
    this._mock._load(this);
  }
  this.dispatchEvent(new Event("play"));
  this._mock.paused = false;
  this.dispatchEvent(new Event("playing"));
};

global.HTMLVideoElement.prototype.pause = function pauseMock(this: HTMLVideoElement) {
  this.dispatchEvent(new Event("pause"));
  this._mock.paused = true;
};

// Fullscreen API mock — jsdom does not implement the Fullscreen API
let _fullscreenElement: Element | null = null;

Object.defineProperty(global.document, "fullscreenElement", {
  get() {
    return _fullscreenElement;
  },
  configurable: true,
});

global.HTMLVideoElement.prototype.requestFullscreen = async function requestFullscreenMock(
  this: HTMLVideoElement,
) {
  _fullscreenElement = this;
  document.dispatchEvent(new Event("fullscreenchange"));
};

global.document.exitFullscreen = async function exitFullscreenMock() {
  _fullscreenElement = null;
  document.dispatchEvent(new Event("fullscreenchange"));
};

export {};
