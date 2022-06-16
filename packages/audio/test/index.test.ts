import "./setup";
import { createRoot, createSignal } from "solid-js";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { makeAudio, makeAudioPlayer, createAudio } from "../src/index";

const testMA = suite("makeAudio");

const testPath = 'https://github.com/solidjs-community/solid-primitives/blob/audio/packages/audio/dev/sample1.mp3?raw=true';

testMA("test static string path", () =>
  createRoot(dispose => {
    const player = makeAudio(testPath);
    assert.is(player._mock.paused, true);
    assert.is(player.src, testPath);
    dispose();
  })
);

testMA.run();

const testMAP = suite("makeAudioPlayer");

testMAP("test play pause", () =>
  createRoot(async dispose => {
    const { player, play, pause } = makeAudioPlayer(testPath);
    assert.is(player.src, testPath);
    assert.is(player._mock.paused, true);
    await play();
    assert.is(player._mock.paused, false);
    await pause();
    assert.is(player.paused, true);
    dispose();
  })
);

testMAP("test seek and volume", () =>
  createRoot(async dispose => {
    const { player, seek, setVolume } = makeAudioPlayer(testPath);
    seek(500);
    assert.is(player.currentTime, 500);
    setVolume(0.75);
    assert.is(player.volume, 0.75);
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
    let [audio] = createAudio(media);
    assert.is(typeof audio.player.srcObject, 'object');
    [audio] = createAudio(() => media);
    assert.is(typeof audio.player.srcObject, 'object');
    dispose();
  })
);

testCA("test basic reactive controls", () =>
  createRoot(async dispose => {
    const [playing, setPlaying] = createSignal(false);
    const [volume, setVolume] = createSignal(0.25);
    const [audio, {play}] = createAudio("test.mp3", playing, volume);
    audio.player._mock._load(audio.player);
    assert.is(audio.player._mock.paused, true);
    await setPlaying(true);
    assert.is(audio.player._mock.paused, false);
    assert.is(audio.player.volume, 0.25);
    await setVolume(0.5);
    assert.is(audio.player.volume, 0.5);
    dispose();
  })
);

testCA.run();
