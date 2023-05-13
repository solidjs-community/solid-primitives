import { type Component, type JSX, createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { createStream } from "../src";
import { createPermission } from "../../permission/src";
import { createCameras, createMicrophones } from "../../devices/src";

declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties {
      srcObject?: MediaStream;
    }
  }
}

const iceservers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

enum CALL_STATE {
  IDLE,
  INITIATED,
  ACTIVE,
}

const App: Component = (): JSX.Element => {
  const microphones = createMicrophones();
  const cameras = createCameras();

  const microphonePermission = createPermission("microphone");
  const cameraPermission = createPermission("camera");

  const [foundDevice, setFoundDevice] = createSignal(false);
  const [constraints, setContraints] = createStore<MediaStreamConstraints>({});
  createEffect(() => {
    if (microphones().length > 0) {
      setContraints("audio", { deviceId: microphones()[0].deviceId });
      setFoundDevice(true);
    }

    if (cameras().length > 0) {
      setContraints("video", { deviceId: cameras()[0].deviceId });
      setFoundDevice(true);
    }
  });

  const [localStream, { mutate, stop }] = createStream(() =>
    foundDevice() ? constraints : undefined,
  );
  const [remoteStream, setRemoteStream] = createSignal<MediaStream>();

  const [CallState, setCallState] = createSignal<CALL_STATE>(CALL_STATE.IDLE);
  const [ICE, setICE] = createSignal("");
  const [input, setInput] = createSignal("");

  let connection = new RTCPeerConnection(iceservers);

  connection.ontrack = event => {
    setRemoteStream(event.streams[0]);
  };

  connection.onicecandidate = () => {
    setICE(JSON.stringify(connection.localDescription));
  };

  createEffect(() => {
    const stream = localStream();
    if (stream === undefined) {
      return;
    }
    stream.getTracks().forEach(track => connection.addTrack(track, stream));
  });

  async function startCall() {
    if (!localStream() || connection.localDescription !== null) {
      return;
    }
    setCallState(CALL_STATE.INITIATED);
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
  }

  async function answerCall() {
    if (!localStream() || connection.localDescription !== null) {
      return;
    }
    setCallState(CALL_STATE.ACTIVE);
    let remoteOffer = JSON.parse(input());
    connection.setRemoteDescription(remoteOffer);
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
  }

  async function addRemote() {
    let remoteAnswer = JSON.parse(input());
    if (connection.remoteDescription === null) {
      await connection.setRemoteDescription(remoteAnswer);
    } else {
      await connection.addIceCandidate(remoteAnswer);
    }
  }

  async function toggleAudio() {
    mutate(s => {
      s?.getAudioTracks().forEach(track => (track.enabled = !track.enabled));
      return s;
    });
  }

  async function toggleVideo() {
    mutate(s => {
      s?.getVideoTracks().forEach(track => (track.enabled = !track.enabled));
      return s;
    });
  }

  async function endCall() {
    connection.close();
    stop();
    setCallState(CALL_STATE.IDLE);
    setICE("");
    setInput("");
  }

  return (
    <div class="App">
      <div class="video-container">
        <video class="video" prop:srcObject={localStream()} autoplay playsinline muted={true} />
        <video class="video" prop:srcObject={remoteStream()} playsinline autoplay />
      </div>
      <input
        type="text"
        class="SDP-Input"
        value={input()}
        onChange={e => setInput(e.currentTarget.value)}
      />
      <div class="action-buttons">
        <button
          disabled={localStream() === undefined || CallState() > CALL_STATE.IDLE}
          onClick={startCall}
        >
          Start Call
        </button>
        <button
          disabled={localStream() === undefined || CallState() > CALL_STATE.IDLE}
          onClick={answerCall}
        >
          Answer Call
        </button>
        <button onClick={addRemote} disabled={CallState() != CALL_STATE.INITIATED}>
          Add Remote
        </button>
        <button onClick={toggleAudio} disabled={microphonePermission() != "granted"}>
          Toggle Audio
        </button>
        <button onClick={toggleVideo} disabled={cameraPermission() != "granted"}>
          Toggle Video
        </button>
        <button onClick={endCall} disabled={CallState() == CALL_STATE.IDLE}>
          End Call
        </button>
      </div>
      <h3>ICE :</h3>
      <p class="sdp-text">{ICE()}</p>
    </div>
  );
};

export default App;
