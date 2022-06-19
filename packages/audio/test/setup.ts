import "regenerator-runtime/runtime";

declare global {
  interface HTMLMediaElement {
    _mock: any;
  }
}

// Mock data and helper methods
global.HTMLMediaElement.prototype._mock = {
  paused: true,
  duration: NaN,
  _loaded: false,
  // Emulates the audio file loading
  _load: function audioInit(audio: HTMLAudioElement) {
    audio.dispatchEvent(new Event("loadeddata"));
    audio.dispatchEvent(new Event("loadedmetadata"));
    audio.dispatchEvent(new Event("canplaythrough"));
    this.duration = 5000;
    this._loaded = true;
  },
  // Reset audio object mock data to the initial state
  _resetMock: function resetMock(audio: HTMLAudioElement) {
    audio._mock = Object.assign({}, global.HTMLMediaElement.prototype._mock);
  }
};

// Get "paused" value, it is automatically set to true / false when we play / pause the audio.
Object.defineProperty(global.HTMLMediaElement.prototype, "paused", {
  get() {
    return this._mock.paused;
  }
});

// Get and set audio duration
Object.defineProperty(global.HTMLMediaElement.prototype, "duration", {
  get() {
    return this._mock.duration;
  },
  set(value) {
    // Reset the mock state to initial (paused) when we set the duration.
    this._mock._resetMock(this);
    this._mock.duration = value;
  }
});

// Get and set audio volume
Object.defineProperty(global.HTMLMediaElement.prototype, "volume", {
  get() {
    return this._mock.volume;
  },
  set(value) {
    this._mock.volume = value;
  }
});

// Start the playback.
global.HTMLMediaElement.prototype.play = async function playMock() {
  if (!this._mock._loaded) {
    this._mock._load(this);
  }
  this.dispatchEvent(new Event("play"));
  this._mock.paused = false;
};

// Pause the playback
global.HTMLMediaElement.prototype.pause = function pauseMock() {
  this.dispatchEvent(new Event("pause"));
  this._mock.paused = true;
};
