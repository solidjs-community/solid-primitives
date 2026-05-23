class AudioContextMock {
  public state: AudioContextState = "running";

  constructor(_options?: AudioContextOptions) {}

  resume() {
    return Promise.resolve();
  }

  createAnalyser() {
    return Object.assign(
      {
        frequencyBinCount: 128,
        getByteFrequencyData: (array: Uint8Array) => {
          array.set([...array].map(() => (Math.random() * 255) | 0));
        },
      } as AnalyserNode,
      {
        connect: () => null,
        disconnect: () => null,
      },
    );
  }

  createMediaStreamSource(mediaStream: MediaStream) {
    return Object.assign(
      {
        mediaStream,
      } as MediaStreamAudioSourceNode,
      { connect: () => null, disconnect: () => null },
    );
  }

  close() {
    if (this.state === "closed") {
      return Promise.reject(new Error("Closing an already closed AudioContext"));
    }
    this.state = "closed";
    return Promise.resolve();
  }
}
(window as any).AudioContext ??= AudioContextMock;
(globalThis as any).AudioContext ??= AudioContextMock;

(window as any).__mockstream__ = Object.assign(new EventTarget(), {
  getTracks: () => [],
  getVideoTracks: () => [],
  getAudioTracks: () => [],
});

(window as any).__mockscreen__ = Object.assign(new EventTarget(), {
  getTracks: () => [],
  getVideoTracks: () => [],
  getAudioTracks: () => [],
});

(navigator as any).mediaDevices = {
  getUserMedia: (_constraints: MediaStreamConstraints) => {
    return Promise.resolve((window as any).__mockstream__ as MediaStream);
  },
  getDisplayMedia: (_constraints: DisplayMediaStreamConstraints) => {
    return Promise.resolve((window as any).__mockscreen__ as MediaStream);
  },
};
