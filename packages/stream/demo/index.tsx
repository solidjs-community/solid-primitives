import { Component, createEffect, createSignal, splitProps } from 'solid-js';
import { createStream } from "../src";
import type { JSX } from "solid-js"

declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties {
      srcObject?: MediaStream
    }
  }
}

export type E = JSX.Element

const Video: Component<JSX.MediaHTMLAttributes<HTMLVideoElement> & { srcObject?: MediaStream }> = (props) => {
  const [local, other] = splitProps(props, ['srcObject'])
  return <video {...other} prop:srcObject={local.srcObject?.getTracks().length ? local.srcObject : undefined}></video>
}

const App: Component = () => {
  const [stream, { mutate, stop }] = createStream({ video: true, audio: true })
  const [remoteStream, setRemoteStream] = createSignal<MediaStream>()

  const [ICE, setICE] = createSignal("")
  const [input, setInput] = createSignal("")
  
  let PeerConnection = new RTCPeerConnection()
  
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
    if(PeerConnection.localDescription !== null) return
    const offer = await PeerConnection.createOffer()
    await PeerConnection.setLocalDescription(offer)
  }

  async function AnswerCall() {
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

  async function Video_() {
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
      <video class="video" prop:srcObject={stream()} autoplay playsinline muted={true}></video>
      <Video class="video" srcObject={remoteStream()} autoplay></Video>
    </div>
    <input type='text' class='SDP-Input' value={input()} onChange={e => setInput(e.currentTarget.value)}  />
    <div class='action-buttons'>
      <button onClick={StartCall}>Start Call</button>
      <button onClick={AnswerCall}>Answer Call</button>
      <button onClick={AddRemote}>Add Remote</button>
      <button onClick={Mute}>Mute</button>
      <button onClick={Video_}>Video</button> 
      <button onClick={EndCall}>End Call</button> 
    </div>
    <h3>ICE :</h3>
    <p class='sdp-text'>{ICE()}</p>
    </div>
  );
};

render(() => <App />, document.getElementById("root"));
