if (!window.AudioContext) {
  class AudioContextMock {
    public state: AudioContextState = "running";
    constructor(private options: AudioContextOptions) {}

    createAnalyser() {
      return Object.assign(
        {
          frequencyBinCount: 128,
          getByteFrequencyData: array => {
            array.set([...array].map(() => (Math.random() * 255) | 0));
          }
        } as AnalyserNode,
        {
          connect: () => null,
          disconnect: () => null
        }
      );
    }
    createMediaStreamSource(mediaStream) {
      return Object.assign(
        {
          mediaStream
        } as MediaStreamAudioSourceNode,
        { connect: () => null, disconnect: () => null }
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
  (window as any).AudioContext = AudioContextMock;
}

(window as any).__mockstream__ = Object.assign(new EventTarget(), {
  getTracks: () => [],
  getVideoTracks: () => [],
  getAudioTracks: () => []
});

(navigator as any).mediaDevices = {
  getUserMedia: (constraints: MediaStreamConstraints) => {
    const fakeMediaStream: MediaStream = (window as any).__mockstream__;
    return Promise.resolve(Object.assign(fakeMediaStream, constraints));
  }
};
