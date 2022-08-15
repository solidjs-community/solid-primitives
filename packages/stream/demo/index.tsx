import { render } from "solid-js/web";
import { Component, createEffect, createSignal } from 'solid-js';
import { createStream } from "../src";

declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties {
      srcObject?: MediaStream
    }
  }
}

const iceservers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
}

const App: Component = () => {
  const [stream, { mutate, stop }] = createStream({ video: true, audio: true })
  const [remoteStream, setRemoteStream] = createSignal<MediaStream>()

  const [ICE, setICE] = createSignal("")
  const [input, setInput] = createSignal("")
  
  let PeerConnection = new RTCPeerConnection(iceservers)
  
  PeerConnection.ontrack = (event) => {
    setRemoteStream(event.streams[0])
  }

  PeerConnection.onicecandidate = () => {
    setICE(JSON.stringify(PeerConnection.localDescription))
  }
  
  createEffect(() => {
    const RawStream = stream()
    if (RawStream === undefined) return
    RawStream.getTracks().forEach(track => PeerConnection.addTrack(track, RawStream))
  })
  
  async function StartCall() {
    if (stream() === undefined) return alert("local Stream not ready yet")

    if(PeerConnection.localDescription !== null) return
    const offer = await PeerConnection.createOffer()
    await PeerConnection.setLocalDescription(offer)
  }

  async function AnswerCall() {
    if (stream() === undefined) return alert("local stream not ready yet")

    if(PeerConnection.localDescription !== null) return
    let remoteOffer = JSON.parse(input())
    PeerConnection.setRemoteDescription(remoteOffer)
    const answer = await PeerConnection.createAnswer()
    await PeerConnection.setLocalDescription(answer)
  }

  async function AddRemote() {
    let remoteAnswer = JSON.parse(input())
    if (PeerConnection.remoteDescription === null) {
      await PeerConnection.setRemoteDescription(remoteAnswer)
    } else {
      await PeerConnection.addIceCandidate(remoteAnswer)
    }
  }
  
  async function Mute() {
    mutate(s => {
      s?.getAudioTracks().forEach(track => track.enabled = !track.enabled)
      return s
    })
  }

  async function Video() {
    mutate(s => {
      s?.getVideoTracks().forEach(track => track.enabled = !track.enabled)
      return s
    })
  }
  
  async function EndCall() {
    PeerConnection.close()
    stop()
    setICE("")
    setInput("")
  }
  
  return (
    <div class="App">
    <div class="video-container">
      <video class="video" prop:srcObject={stream()} autoplay playsinline muted={true} />
      <video class="video" prop:srcObject={remoteStream()} playsinline autoplay />
    </div>
    <input type='text' class='SDP-Input' value={input()} onChange={e => setInput(e.currentTarget.value)}  />
    <div class='action-buttons'>
      <button onClick={StartCall}>Start Call</button>
      <button onClick={AnswerCall}>Answer Call</button>
      <button onClick={AddRemote}>Add Remote</button>
      <button onClick={Mute}>Mute</button>
      <button onClick={Video}>Video</button> 
      <button onClick={EndCall}>End Call</button> 
    </div>
    <h3>ICE :</h3>
    <p class='sdp-text'>{ICE()}</p>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
