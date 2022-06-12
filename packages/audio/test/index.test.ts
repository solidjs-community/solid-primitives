import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import { MockAudio } from "./setup";
import * as assert from "uvu/assert";
import { makeAudio, makeAudioPlayer, createAudio, AudioState } from "../src/index";
import { isObject } from "@solid-primitives/utils";

const testMA = suite("makeAudio");

testMA("test static string path", () =>
  createRoot(dispose => {
    const player = makeAudio("test.mp3") as MockAudio;
    assert.is(player.playing, false);
    assert.is(player.state, AudioState.STOPPED);
    assert.is(player.src, "https://localhost:3000/test.mp3");
    dispose();
  })
);

testMA.run();

const testMAP = suite("makeAudioPlayer");

testMAP("test play pause", () =>
  createRoot(async dispose => {
    const { player, play, pause } = makeAudioPlayer("test.mp3");
    const mocked = player as MockAudio;
    assert.is(mocked.src, "https://localhost:3000/test.mp3");
    assert.is(mocked.playing, false);
    assert.is(mocked.state, AudioState.STOPPED);
    await play();
    assert.is(mocked.playing, true);
    assert.is(mocked.state, AudioState.PLAYING);
    await pause();
    assert.is(mocked.playing, false);
    assert.is(mocked.state, AudioState.PAUSED);
    dispose();
  })
);

testMAP("test seek and volume", () =>
  createRoot(async dispose => {
    const { player, seek, setVolume } = makeAudioPlayer("test.mp3");
    const mocked = player as MockAudio;
    seek(500);
    assert.is(mocked.currentTime, 500);
    setVolume(0.75);
    assert.is(mocked.volume, 0.75);
    dispose();
  })
);

testMAP("test srcObject value path", () =>
  createRoot(dispose => {
    const { player } = makeAudioPlayer({} as MediaSource);
    assert.is(typeof player.srcObject, 'object');
    dispose();
  })
);

testMAP.run();

const testCA = suite("createAudioPlayer");

testCA("test srcObject value path", () =>
  createRoot(dispose => {
    const media = {} as MediaSource;
    let audio = createAudio(media);
    let mocked = audio.player as MockAudio;
    assert.is(typeof mocked.srcObject, 'object');
    audio = createAudio(() => media);
    mocked = audio.player as MockAudio;
    assert.is(typeof mocked.srcObject, 'object');
    dispose();
  })
);

testCA("test basic reactive controls", () =>
  createRoot(async dispose => {
    const [playing, setPlaying] = createSignal(false);
    const [playhead, setPlayhead] = createSignal(0);
    const [volume, setVolume] = createSignal(0.25);
    const audio = createAudio("test.mp3", playing, playhead, volume);
    const mocked = audio.player as MockAudio;
    assert.is(mocked.playing, false);
    setPlaying(true);
    assert.is(mocked.playing, true);
    assert.is(mocked.duration, 5000);
    assert.is(mocked.volume, 0.25);
    dispose();
  })
);

testCA.run();
