// Do not modify
// Generated from "./scripts/update-site/build-html-table"

import THead from "./THead";
import Table from "./Table";
import TH from "./TH";
import TD from "./TD";
import TR from "./TR";
import SizeBadge from "./SizeBadge";
import { SizeBadgeWrapper } from "./SizeBadge";
import VersionBadge from "./VersionBadge";
import StageBadge from "./StageBadge";
import PrimitiveBtn from "./PrimitiveBtn";
import PrimitiveBtnLineWrapper from "./PrimitiveBtnLineWrapper";

const PrimitivesTable = () => {
  return (
    <Table>
      <THead>
        <TH>Name</TH>
        <TH>Stage</TH>
        <TH>Primitives</TH>
        <TH>Size</TH>
        <TH>NPM</TH>
      </THead>
      <tbody>
        <TR>
          <TD h4>Inputs</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="active-element">active-element</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createActiveElement">
              <PrimitiveBtn href="/active-element#createactiveelement">
                createActiveElement
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createFocusSignal">
              <PrimitiveBtn href="/active-element#createfocussignal">
                createFocusSignal
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createActiveElement">
              <SizeBadge
                value="429"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Factive-element&treeshake=%5B%7BcreateActiveElement%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createFocusSignal">
              <SizeBadge
                value="479"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Factive-element&treeshake=%5B%7BcreateFocusSignal%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/active-element.json"
              href="https://www.npmjs.com/package/@solid-primitives/active-element"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="autofocus">autofocus</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="autofocus">
              <PrimitiveBtn href="/autofocus#autofocus">autofocus</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAutofocus">
              <PrimitiveBtn href="/autofocus#createautofocus">createAutofocus</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="autofocus">
              <SizeBadge
                value="126"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fautofocus&treeshake=%5B%7Bautofocus%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAutofocus">
              <SizeBadge
                value="118"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fautofocus&treeshake=%5B%7BcreateAutofocus%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/autofocus.json"
              href="https://www.npmjs.com/package/@solid-primitives/autofocus"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="input-mask">input-mask</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createInputMask">
              <PrimitiveBtn href="/input-mask#createinputmask">createInputMask</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createInputMask">
              <SizeBadge
                value="532"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Finput-mask&treeshake=%5B%7BcreateInputMask%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/input-mask.json"
              href="https://www.npmjs.com/package/@solid-primitives/input-mask"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="keyboard">keyboard</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="useKeyDownList">
              <PrimitiveBtn href="/keyboard#usekeydownlist">useKeyDownList</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="useCurrentlyHeldKey">
              <PrimitiveBtn href="/keyboard#usecurrentlyheldkey">useCurrentlyHeldKey</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="useKeyDownSequence">
              <PrimitiveBtn href="/keyboard#usekeydownsequence">useKeyDownSequence</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createKeyHold">
              <PrimitiveBtn href="/keyboard#createkeyhold">createKeyHold</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createShortcut">
              <PrimitiveBtn href="/keyboard#createshortcut">createShortcut</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="useKeyDownList">
              <SizeBadge
                value="605"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyboard&treeshake=%5B%7BuseKeyDownList%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="useCurrentlyHeldKey">
              <SizeBadge
                value="665"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyboard&treeshake=%5B%7BuseCurrentlyHeldKey%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="useKeyDownSequence">
              <SizeBadge
                value="646"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyboard&treeshake=%5B%7BuseKeyDownSequence%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createKeyHold">
              <SizeBadge
                value="725"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyboard&treeshake=%5B%7BcreateKeyHold%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createShortcut">
              <SizeBadge
                value="926"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyboard&treeshake=%5B%7BcreateShortcut%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/keyboard.json"
              href="https://www.npmjs.com/package/@solid-primitives/keyboard"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="mouse">mouse</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createMousePosition">
              <PrimitiveBtn href="/mouse#createmouseposition">createMousePosition</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createPositionToElement">
              <PrimitiveBtn href="/mouse#createpositiontoelement">
                createPositionToElement
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createMousePosition">
              <SizeBadge
                value="1.21"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmouse&treeshake=%5B%7BcreateMousePosition%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createPositionToElement">
              <SizeBadge
                value="1.43"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmouse&treeshake=%5B%7BcreatePositionToElement%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/mouse.json"
              href="https://www.npmjs.com/package/@solid-primitives/mouse"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="pointer">pointer</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createPointerListeners">
              <PrimitiveBtn href="/pointer#createpointerlisteners">
                createPointerListeners
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createPerPointerListeners">
              <PrimitiveBtn href="/pointer#createperpointerlisteners">
                createPerPointerListeners
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createPointerPosition">
              <PrimitiveBtn href="/pointer#createpointerposition">
                createPointerPosition
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createPointerList">
              <PrimitiveBtn href="/pointer#createpointerlist">createPointerList</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createPointerListeners">
              <SizeBadge
                value="730"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpointer&treeshake=%5B%7BcreatePointerListeners%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createPerPointerListeners">
              <SizeBadge
                value="997"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpointer&treeshake=%5B%7BcreatePerPointerListeners%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createPointerPosition">
              <SizeBadge
                value="991"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpointer&treeshake=%5B%7BcreatePointerPosition%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createPointerList">
              <SizeBadge
                value="1.3"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpointer&treeshake=%5B%7BcreatePointerList%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/pointer.json"
              href="https://www.npmjs.com/package/@solid-primitives/pointer"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="scroll">scroll</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createScrollPosition">
              <PrimitiveBtn href="/scroll#createscrollposition">createScrollPosition</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="useWindowScrollPosition">
              <PrimitiveBtn href="/scroll#usewindowscrollposition">
                useWindowScrollPosition
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createScrollPosition">
              <SizeBadge
                value="788"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscroll&treeshake=%5B%7BcreateScrollPosition%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="useWindowScrollPosition">
              <SizeBadge
                value="902"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscroll&treeshake=%5B%7BuseWindowScrollPosition%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/scroll.json"
              href="https://www.npmjs.com/package/@solid-primitives/scroll"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="selection">selection</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createSelection">
              <PrimitiveBtn href="/selection#createselection">createSelection</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createSelection">
              <SizeBadge
                value="800"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fselection&treeshake=%5B%7BcreateSelection%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/selection.json"
              href="https://www.npmjs.com/package/@solid-primitives/selection"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Display & Media</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="audio">audio</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="makeAudio">
              <PrimitiveBtn href="/audio#makeaudio">makeAudio</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="makeAudioPlayer">
              <PrimitiveBtn href="/audio#makeaudioplayer">makeAudioPlayer</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAudio">
              <PrimitiveBtn href="/audio#createaudio">createAudio</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="makeAudio">
              <SizeBadge
                value="284"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Faudio&treeshake=%5B%7BmakeAudio%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="makeAudioPlayer">
              <SizeBadge
                value="467"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Faudio&treeshake=%5B%7BmakeAudioPlayer%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAudio">
              <SizeBadge
                value="1.07"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Faudio&treeshake=%5B%7BcreateAudio%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/audio.json"
              href="https://www.npmjs.com/package/@solid-primitives/audio"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="bounds">bounds</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createElementBounds">
              <PrimitiveBtn href="/bounds#createelementbounds">createElementBounds</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createElementBounds">
              <SizeBadge
                value="1.42"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fbounds&treeshake=%5B%7BcreateElementBounds%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/bounds.json"
              href="https://www.npmjs.com/package/@solid-primitives/bounds"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="devices">devices</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createDevices">
              <PrimitiveBtn href="/devices#createdevices">createDevices</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createMicrophones">
              <PrimitiveBtn href="/devices#createmicrophones">createMicrophones</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createSpeakers">
              <PrimitiveBtn href="/devices#createspeakers">createSpeakers</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createCameras">
              <PrimitiveBtn href="/devices#createcameras">createCameras</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAccelerometer">
              <PrimitiveBtn href="/devices#createaccelerometer">createAccelerometer</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createGyroscope">
              <PrimitiveBtn href="/devices#creategyroscope">createGyroscope</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createDevices">
              <SizeBadge
                value="234"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdevices&treeshake=%5B%7BcreateDevices%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createMicrophones">
              <SizeBadge
                value="328"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdevices&treeshake=%5B%7BcreateMicrophones%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createSpeakers">
              <SizeBadge
                value="329"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdevices&treeshake=%5B%7BcreateSpeakers%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createCameras">
              <SizeBadge
                value="328"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdevices&treeshake=%5B%7BcreateCameras%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAccelerometer">
              <SizeBadge
                value="288"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdevices&treeshake=%5B%7BcreateAccelerometer%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createGyroscope">
              <SizeBadge
                value="282"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdevices&treeshake=%5B%7BcreateGyroscope%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/devices.json"
              href="https://www.npmjs.com/package/@solid-primitives/devices"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="idle">idle</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createIdleTimer">
              <PrimitiveBtn href="/idle#createidletimer">createIdleTimer</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createIdleTimer">
              <SizeBadge
                value="650"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fidle&treeshake=%5B%7BcreateIdleTimer%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/idle.json"
              href="https://www.npmjs.com/package/@solid-primitives/idle"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="intersection-observer">intersection-observer</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="makeIntersectionObserver">
              <PrimitiveBtn href="/intersection-observer#makeintersectionobserver">
                makeIntersectionObserver
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createIntersectionObserver">
              <PrimitiveBtn href="/intersection-observer#createintersectionobserver">
                createIntersectionObserver
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createViewportObserver">
              <PrimitiveBtn href="/intersection-observer#createviewportobserver">
                createViewportObserver
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createVisibilityObserver">
              <PrimitiveBtn href="/intersection-observer#createvisibilityobserver">
                createVisibilityObserver
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="makeIntersectionObserver">
              <SizeBadge
                value="406"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fintersection-observer&treeshake=%5B%7BmakeIntersectionObserver%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createIntersectionObserver">
              <SizeBadge
                value="541"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fintersection-observer&treeshake=%5B%7BcreateIntersectionObserver%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createViewportObserver">
              <SizeBadge
                value="722"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fintersection-observer&treeshake=%5B%7BcreateViewportObserver%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createVisibilityObserver">
              <SizeBadge
                value="722"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fintersection-observer&treeshake=%5B%7BcreateVisibilityObserver%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/intersection-observer.json"
              href="https://www.npmjs.com/package/@solid-primitives/intersection-observer"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="media">media</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="makeMediaQueryListener">
              <PrimitiveBtn href="/media#makemediaquerylistener">
                makeMediaQueryListener
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createMediaQuery">
              <PrimitiveBtn href="/media#createmediaquery">createMediaQuery</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createBreakpoints">
              <PrimitiveBtn href="/media#createbreakpoints">createBreakpoints</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="usePrefersDark">
              <PrimitiveBtn href="/media#useprefersdark">usePrefersDark</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="makeMediaQueryListener">
              <SizeBadge
                value="598"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmedia&treeshake=%5B%7BmakeMediaQueryListener%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createMediaQuery">
              <SizeBadge
                value="554"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmedia&treeshake=%5B%7BcreateMediaQuery%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createBreakpoints">
              <SizeBadge
                value="995"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmedia&treeshake=%5B%7BcreateBreakpoints%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="usePrefersDark">
              <SizeBadge
                value="554"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmedia&treeshake=%5B%7BusePrefersDark%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/media.json"
              href="https://www.npmjs.com/package/@solid-primitives/media"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="page-visibility">page-visibility</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createPageVisibility">
              <PrimitiveBtn href="/page-visibility#createpagevisibility">
                createPageVisibility
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createPageVisibility">
              <SizeBadge
                value="529"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpage-visibility&treeshake=%5B%7BcreatePageVisibility%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/page-visibility.json"
              href="https://www.npmjs.com/package/@solid-primitives/page-visibility"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="resize-observer">resize-observer</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createResizeObserver">
              <PrimitiveBtn href="/resize-observer#createresizeobserver">
                createResizeObserver
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createWindowSize">
              <PrimitiveBtn href="/resize-observer#createwindowsize">createWindowSize</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createElementSize">
              <PrimitiveBtn href="/resize-observer#createelementsize">
                createElementSize
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createResizeObserver">
              <SizeBadge
                value="653"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fresize-observer&treeshake=%5B%7BcreateResizeObserver%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createWindowSize">
              <SizeBadge
                value="664"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fresize-observer&treeshake=%5B%7BcreateWindowSize%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createElementSize">
              <SizeBadge
                value="1.04"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fresize-observer&treeshake=%5B%7BcreateElementSize%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/resize-observer.json"
              href="https://www.npmjs.com/package/@solid-primitives/resize-observer"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="styles">styles</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createRemSize">
              <PrimitiveBtn href="/styles#createremsize">createRemSize</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createRemSize">
              <SizeBadge
                value="642"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstyles&treeshake=%5B%7BcreateRemSize%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/styles.json"
              href="https://www.npmjs.com/package/@solid-primitives/styles"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Browser APIs</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="broadcast-channel">broadcast-channel</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="makeBroadcastChannel">
              <PrimitiveBtn href="/broadcast-channel#makebroadcastchannel">
                makeBroadcastChannel
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createBroadcastChannel">
              <PrimitiveBtn href="/broadcast-channel#createbroadcastchannel">
                createBroadcastChannel
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="makeBroadcastChannel">
              <SizeBadge
                value="479"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fbroadcast-channel&treeshake=%5B%7BmakeBroadcastChannel%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createBroadcastChannel">
              <SizeBadge
                value="551"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fbroadcast-channel&treeshake=%5B%7BcreateBroadcastChannel%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/broadcast-channel.json"
              href="https://www.npmjs.com/package/@solid-primitives/broadcast-channel"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="clipboard">clipboard</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="copyClipboard">
              <PrimitiveBtn href="/clipboard#copyclipboard">copyClipboard</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="writeClipboard">
              <PrimitiveBtn href="/clipboard#writeclipboard">writeClipboard</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createClipboard">
              <PrimitiveBtn href="/clipboard#createclipboard">createClipboard</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="copyClipboard">
              <SizeBadge
                value="0"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fclipboard&treeshake=%5B%7BcopyClipboard%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="writeClipboard">
              <SizeBadge
                value="164"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fclipboard&treeshake=%5B%7BwriteClipboard%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createClipboard">
              <SizeBadge
                value="494"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fclipboard&treeshake=%5B%7BcreateClipboard%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/clipboard.json"
              href="https://www.npmjs.com/package/@solid-primitives/clipboard"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="event-listener">event-listener</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createEventListener">
              <PrimitiveBtn href="/event-listener#createeventlistener">
                createEventListener
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createEventSignal">
              <PrimitiveBtn href="/event-listener#createeventsignal">
                createEventSignal
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createEventListenerMap">
              <PrimitiveBtn href="/event-listener#createeventlistenermap">
                createEventListenerMap
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="WindowEventListener">
              <PrimitiveBtn href="/event-listener#windoweventlistener">
                WindowEventListener
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="DocumentEventListener">
              <PrimitiveBtn href="/event-listener#documenteventlistener">
                DocumentEventListener
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createEventListener">
              <SizeBadge
                value="354"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-listener&treeshake=%5B%7BcreateEventListener%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createEventSignal">
              <SizeBadge
                value="384"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-listener&treeshake=%5B%7BcreateEventSignal%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createEventListenerMap">
              <SizeBadge
                value="398"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-listener&treeshake=%5B%7BcreateEventListenerMap%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="WindowEventListener">
              <SizeBadge
                value="357"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-listener&treeshake=%5B%7BWindowEventListener%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="DocumentEventListener">
              <SizeBadge
                value="360"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-listener&treeshake=%5B%7BDocumentEventListener%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/event-listener.json"
              href="https://www.npmjs.com/package/@solid-primitives/event-listener"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="event-props">event-props</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createEventProps">
              <PrimitiveBtn href="/event-props#createeventprops">createEventProps</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createEventProps">
              <SizeBadge
                value="172"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-props&treeshake=%5B%7BcreateEventProps%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/event-props.json"
              href="https://www.npmjs.com/package/@solid-primitives/event-props"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="fullscreen">fullscreen</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createFullscreen">
              <PrimitiveBtn href="/fullscreen#createfullscreen">createFullscreen</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createFullscreen">
              <SizeBadge
                value="317"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ffullscreen&treeshake=%5B%7BcreateFullscreen%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/fullscreen.json"
              href="https://www.npmjs.com/package/@solid-primitives/fullscreen"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="geolocation">geolocation</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createGeolocation">
              <PrimitiveBtn href="/geolocation#creategeolocation">createGeolocation</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createGeolocationWatcher">
              <PrimitiveBtn href="/geolocation#creategeolocationwatcher">
                createGeolocationWatcher
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createGeolocation">
              <SizeBadge
                value="466"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fgeolocation&treeshake=%5B%7BcreateGeolocation%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createGeolocationWatcher">
              <SizeBadge
                value="705"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fgeolocation&treeshake=%5B%7BcreateGeolocationWatcher%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/geolocation.json"
              href="https://www.npmjs.com/package/@solid-primitives/geolocation"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="mutation-observer">mutation-observer</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createMutationObserver">
              <PrimitiveBtn href="/mutation-observer#createmutationobserver">
                createMutationObserver
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createMutationObserver">
              <SizeBadge
                value="421"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmutation-observer&treeshake=%5B%7BcreateMutationObserver%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/mutation-observer.json"
              href="https://www.npmjs.com/package/@solid-primitives/mutation-observer"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="permission">permission</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createPermission">
              <PrimitiveBtn href="/permission#createpermission">createPermission</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createPermission">
              <SizeBadge
                value="435"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpermission&treeshake=%5B%7BcreatePermission%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/permission.json"
              href="https://www.npmjs.com/package/@solid-primitives/permission"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="storage">storage</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createStorage">
              <PrimitiveBtn href="/storage#createstorage">createStorage</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createCookieStorage">
              <PrimitiveBtn href="/storage#createcookiestorage">createCookieStorage</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAsyncStorage">
              <PrimitiveBtn href="/storage#createasyncstorage">createAsyncStorage</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createStorageSignal">
              <PrimitiveBtn href="/storage#createstoragesignal">createStorageSignal</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createLocalStorage">
              <PrimitiveBtn href="/storage#createlocalstorage">createLocalStorage</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createSessionStorage">
              <PrimitiveBtn href="/storage#createsessionstorage">createSessionStorage</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createStorage">
              <SizeBadge
                value="962"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstorage&treeshake=%5B%7BcreateStorage%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createCookieStorage">
              <SizeBadge
                value="1.42"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstorage&treeshake=%5B%7BcreateCookieStorage%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAsyncStorage">
              <SizeBadge
                value="1.01"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstorage&treeshake=%5B%7BcreateAsyncStorage%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createStorageSignal">
              <SizeBadge
                value="797"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstorage&treeshake=%5B%7BcreateStorageSignal%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createLocalStorage">
              <SizeBadge
                value="971"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstorage&treeshake=%5B%7BcreateLocalStorage%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createSessionStorage">
              <SizeBadge
                value="989"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstorage&treeshake=%5B%7BcreateSessionStorage%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/storage.json"
              href="https://www.npmjs.com/package/@solid-primitives/storage"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="timer">timer</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="makeTimer">
              <PrimitiveBtn href="/timer#maketimer">makeTimer</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createTimer">
              <PrimitiveBtn href="/timer#createtimer">createTimer</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createTimeoutLoop">
              <PrimitiveBtn href="/timer#createtimeoutloop">createTimeoutLoop</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createPolled">
              <PrimitiveBtn href="/timer#createpolled">createPolled</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createIntervalCounter">
              <PrimitiveBtn href="/timer#createintervalcounter">createIntervalCounter</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="makeTimer">
              <SizeBadge
                value="163"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftimer&treeshake=%5B%7BmakeTimer%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createTimer">
              <SizeBadge
                value="371"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftimer&treeshake=%5B%7BcreateTimer%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createTimeoutLoop">
              <SizeBadge
                value="247"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftimer&treeshake=%5B%7BcreateTimeoutLoop%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createPolled">
              <SizeBadge
                value="429"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftimer&treeshake=%5B%7BcreatePolled%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createIntervalCounter">
              <SizeBadge
                value="459"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftimer&treeshake=%5B%7BcreateIntervalCounter%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/timer.json"
              href="https://www.npmjs.com/package/@solid-primitives/timer"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="upload">upload</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createFileUploader">
              <PrimitiveBtn href="/upload#createfileuploader">createFileUploader</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createDropzone">
              <PrimitiveBtn href="/upload#createdropzone">createDropzone</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createFileUploader">
              <SizeBadge
                value="606"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fupload&treeshake=%5B%7BcreateFileUploader%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createDropzone">
              <SizeBadge
                value="676"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fupload&treeshake=%5B%7BcreateDropzone%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/upload.json"
              href="https://www.npmjs.com/package/@solid-primitives/upload"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="workers">workers</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createWorker">
              <PrimitiveBtn href="/workers#createworker">createWorker</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createWorkerPool">
              <PrimitiveBtn href="/workers#createworkerpool">createWorkerPool</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createSignaledWorker">
              <PrimitiveBtn href="/workers#createsignaledworker">createSignaledWorker</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createWorker">
              <SizeBadge
                value="926"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fworkers&treeshake=%5B%7BcreateWorker%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createWorkerPool">
              <SizeBadge
                value="1.06"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fworkers&treeshake=%5B%7BcreateWorkerPool%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createSignaledWorker">
              <SizeBadge
                value="1.03"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fworkers&treeshake=%5B%7BcreateSignaledWorker%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/workers.json"
              href="https://www.npmjs.com/package/@solid-primitives/workers"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Network</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="connectivity">connectivity</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createConnectivitySignal">
              <PrimitiveBtn href="/connectivity#createconnectivitysignal">
                createConnectivitySignal
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createConnectivitySignal">
              <SizeBadge
                value="553"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fconnectivity&treeshake=%5B%7BcreateConnectivitySignal%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/connectivity.json"
              href="https://www.npmjs.com/package/@solid-primitives/connectivity"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="fetch">fetch</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createFetch">
              <PrimitiveBtn href="/fetch#createfetch">createFetch</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createFetch">
              <SizeBadge
                value="835"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ffetch&treeshake=%5B%7BcreateFetch%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/fetch.json"
              href="https://www.npmjs.com/package/@solid-primitives/fetch"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="graphql">graphql</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createGraphQLClient">
              <PrimitiveBtn href="/graphql#creategraphqlclient">createGraphQLClient</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createGraphQLClient">
              <SizeBadge
                value="4.31"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fgraphql&treeshake=%5B%7BcreateGraphQLClient%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/graphql.json"
              href="https://www.npmjs.com/package/@solid-primitives/graphql"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="stream">stream</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createStream">
              <PrimitiveBtn href="/stream#createstream">createStream</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAmplitudeStream">
              <PrimitiveBtn href="/stream#createamplitudestream">
                createAmplitudeStream
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createMediaPermissionRequest">
              <PrimitiveBtn href="/stream#createmediapermissionrequest">
                createMediaPermissionRequest
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAmplitudeFromStream">
              <PrimitiveBtn href="/stream#createamplitudefromstream">
                createAmplitudeFromStream
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createScreen">
              <PrimitiveBtn href="/stream#createscreen">createScreen</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createStream">
              <SizeBadge
                value="527"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstream&treeshake=%5B%7BcreateStream%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAmplitudeStream">
              <SizeBadge
                value="923"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstream&treeshake=%5B%7BcreateAmplitudeStream%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createMediaPermissionRequest">
              <SizeBadge
                value="248"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstream&treeshake=%5B%7BcreateMediaPermissionRequest%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAmplitudeFromStream">
              <SizeBadge
                value="588"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstream&treeshake=%5B%7BcreateAmplitudeFromStream%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createScreen">
              <SizeBadge
                value="451"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fstream&treeshake=%5B%7BcreateScreen%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/stream.json"
              href="https://www.npmjs.com/package/@solid-primitives/stream"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Utilities</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="context">context</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createContextProvider">
              <PrimitiveBtn href="/context#createcontextprovider">
                createContextProvider
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createContextProvider">
              <SizeBadge
                value="151"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fcontext&treeshake=%5B%7BcreateContextProvider%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/context.json"
              href="https://www.npmjs.com/package/@solid-primitives/context"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="cursor">cursor</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createElementCursor">
              <PrimitiveBtn href="/cursor#createelementcursor">createElementCursor</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createBodyCursor">
              <PrimitiveBtn href="/cursor#createbodycursor">createBodyCursor</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createElementCursor">
              <SizeBadge
                value="287"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fcursor&treeshake=%5B%7BcreateElementCursor%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createBodyCursor">
              <SizeBadge
                value="176"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fcursor&treeshake=%5B%7BcreateBodyCursor%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/cursor.json"
              href="https://www.npmjs.com/package/@solid-primitives/cursor"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="date">date</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createDate">
              <PrimitiveBtn href="/date#createdate">createDate</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createDateNow">
              <PrimitiveBtn href="/date#createdatenow">createDateNow</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createTimeDifference">
              <PrimitiveBtn href="/date#createtimedifference">createTimeDifference</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createTimeDifferenceFromNow">
              <PrimitiveBtn href="/date#createtimedifferencefromnow">
                createTimeDifferenceFromNow
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createTimeAgo">
              <PrimitiveBtn href="/date#createtimeago">createTimeAgo</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createCountdown">
              <PrimitiveBtn href="/date#createcountdown">createCountdown</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createCountdownFromNow">
              <PrimitiveBtn href="/date#createcountdownfromnow">
                createCountdownFromNow
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createDate">
              <SizeBadge
                value="497"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateDate%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createDateNow">
              <SizeBadge
                value="499"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateDateNow%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createTimeDifference">
              <SizeBadge
                value="554"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateTimeDifference%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createTimeDifferenceFromNow">
              <SizeBadge
                value="994"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateTimeDifferenceFromNow%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createTimeAgo">
              <SizeBadge
                value="1.58"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateTimeAgo%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createCountdown">
              <SizeBadge
                value="680"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateCountdown%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createCountdownFromNow">
              <SizeBadge
                value="1.12"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdate&treeshake=%5B%7BcreateCountdownFromNow%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/date.json"
              href="https://www.npmjs.com/package/@solid-primitives/date"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="event-bus">event-bus</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createEventBus">
              <PrimitiveBtn href="/event-bus#createeventbus">createEventBus</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createEmitter">
              <PrimitiveBtn href="/event-bus#createemitter">createEmitter</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createEventHub">
              <PrimitiveBtn href="/event-bus#createeventhub">createEventHub</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createEventStack">
              <PrimitiveBtn href="/event-bus#createeventstack">createEventStack</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createEventBus">
              <SizeBadge
                value="274"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-bus&treeshake=%5B%7BcreateEventBus%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createEmitter">
              <SizeBadge
                value="348"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-bus&treeshake=%5B%7BcreateEmitter%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createEventHub">
              <SizeBadge
                value="438"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-bus&treeshake=%5B%7BcreateEventHub%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createEventStack">
              <SizeBadge
                value="550"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-bus&treeshake=%5B%7BcreateEventStack%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/event-bus.json"
              href="https://www.npmjs.com/package/@solid-primitives/event-bus"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="event-dispatcher">event-dispatcher</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createEventDispatcher">
              <PrimitiveBtn href="/event-dispatcher#createeventdispatcher">
                createEventDispatcher
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createEventDispatcher">
              <SizeBadge
                value="215"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fevent-dispatcher&treeshake=%5B%7BcreateEventDispatcher%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/event-dispatcher.json"
              href="https://www.npmjs.com/package/@solid-primitives/event-dispatcher"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="i18n">i18n</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createI18nContext">
              <PrimitiveBtn href="/i18n#createi18ncontext">createI18nContext</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createChainedI18n">
              <PrimitiveBtn href="/i18n#createchainedi18n">createChainedI18n</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createI18nContext">
              <SizeBadge
                value="394"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fi18n&treeshake=%5B%7BcreateI18nContext%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createChainedI18n">
              <SizeBadge
                value="531"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fi18n&treeshake=%5B%7BcreateChainedI18n%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/i18n.json"
              href="https://www.npmjs.com/package/@solid-primitives/i18n"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="immutable">immutable</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="List of functions">
              <PrimitiveBtn href="/immutable#list-of-functions">List of functions</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="Listoffunctions">
              <SizeBadge
                value="1.17"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fimmutable&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/immutable.json"
              href="https://www.npmjs.com/package/@solid-primitives/immutable"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="jsx-parser">jsx-parser</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createJSXParser">
              <PrimitiveBtn href="/jsx-parser#createjsxparser">createJSXParser</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createToken">
              <PrimitiveBtn href="/jsx-parser#createtoken">createToken</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="resolveTokens">
              <PrimitiveBtn href="/jsx-parser#resolvetokens">resolveTokens</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="isToken">
              <PrimitiveBtn href="/jsx-parser#istoken">isToken</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createJSXParser">
              <SizeBadge
                value="133"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fjsx-parser&treeshake=%5B%7BcreateJSXParser%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createToken">
              <SizeBadge
                value="211"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fjsx-parser&treeshake=%5B%7BcreateToken%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="resolveTokens">
              <SizeBadge
                value="295"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fjsx-parser&treeshake=%5B%7BresolveTokens%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="isToken">
              <SizeBadge
                value="109"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fjsx-parser&treeshake=%5B%7BisToken%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/jsx-parser.json"
              href="https://www.npmjs.com/package/@solid-primitives/jsx-parser"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="map">map</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="ReactiveMap">
              <PrimitiveBtn href="/map#reactivemap">ReactiveMap</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="ReactiveWeakMap">
              <PrimitiveBtn href="/map#reactiveweakmap">ReactiveWeakMap</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="ReactiveMap">
              <SizeBadge
                value="571"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmap&treeshake=%5B%7BReactiveMap%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="ReactiveWeakMap">
              <SizeBadge
                value="603"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmap&treeshake=%5B%7BReactiveWeakMap%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/map.json"
              href="https://www.npmjs.com/package/@solid-primitives/map"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="pagination">pagination</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={0} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createPagination">
              <PrimitiveBtn href="/pagination#createpagination">createPagination</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createInfiniteScroll">
              <PrimitiveBtn href="/pagination#createinfinitescroll">
                createInfiniteScroll
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createPagination">
              <SizeBadge
                value="961"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpagination&treeshake=%5B%7BcreatePagination%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createInfiniteScroll">
              <SizeBadge
                value="453"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpagination&treeshake=%5B%7BcreateInfiniteScroll%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/pagination.json"
              href="https://www.npmjs.com/package/@solid-primitives/pagination"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="platform">platform</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="List of variables">
              <PrimitiveBtn href="/platform#list-of-variables">List of variables</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="Listofvariables">
              <SizeBadge
                value="583"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fplatform&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/platform.json"
              href="https://www.npmjs.com/package/@solid-primitives/platform"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="promise">promise</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="promiseTimeout">
              <PrimitiveBtn href="/promise#promisetimeout">promiseTimeout</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="raceTimeout">
              <PrimitiveBtn href="/promise#racetimeout">raceTimeout</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="until">
              <PrimitiveBtn href="/promise#until">until</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="promiseTimeout">
              <SizeBadge
                value="149"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpromise&treeshake=%5B%7BpromiseTimeout%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="raceTimeout">
              <SizeBadge
                value="385"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpromise&treeshake=%5B%7BraceTimeout%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="until">
              <SizeBadge
                value="182"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fpromise&treeshake=%5B%7Buntil%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/promise.json"
              href="https://www.npmjs.com/package/@solid-primitives/promise"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="props">props</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="combineProps">
              <PrimitiveBtn href="/props#combineprops">combineProps</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="filterProps">
              <PrimitiveBtn href="/props#filterprops">filterProps</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="combineProps">
              <SizeBadge
                value="934"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fprops&treeshake=%5B%7BcombineProps%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="filterProps">
              <SizeBadge
                value="268"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fprops&treeshake=%5B%7BfilterProps%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/props.json"
              href="https://www.npmjs.com/package/@solid-primitives/props"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="scheduled">scheduled</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="debounce">
              <PrimitiveBtn href="/scheduled#debounce">debounce</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="throttle">
              <PrimitiveBtn href="/scheduled#throttle">throttle</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="scheduleIdle">
              <PrimitiveBtn href="/scheduled#scheduleidle">scheduleIdle</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="leading">
              <PrimitiveBtn href="/scheduled#leading">leading</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createScheduled">
              <PrimitiveBtn href="/scheduled#createscheduled">createScheduled</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="debounce">
              <SizeBadge
                value="335"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscheduled&treeshake=%5B%7Bdebounce%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="throttle">
              <SizeBadge
                value="291"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscheduled&treeshake=%5B%7Bthrottle%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="scheduleIdle">
              <SizeBadge
                value="293"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscheduled&treeshake=%5B%7BscheduleIdle%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="leading">
              <SizeBadge
                value="373"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscheduled&treeshake=%5B%7Bleading%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createScheduled">
              <SizeBadge
                value="377"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscheduled&treeshake=%5B%7BcreateScheduled%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/scheduled.json"
              href="https://www.npmjs.com/package/@solid-primitives/scheduled"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="script-loader">script-loader</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createScriptLoader">
              <PrimitiveBtn href="/script-loader#createscriptloader">
                createScriptLoader
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createScriptLoader">
              <SizeBadge
                value="329"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fscript-loader&treeshake=%5B%7BcreateScriptLoader%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/script-loader.json"
              href="https://www.npmjs.com/package/@solid-primitives/script-loader"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="set">set</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="ReactiveSet">
              <PrimitiveBtn href="/set#reactiveset">ReactiveSet</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="ReactiveWeakSet">
              <PrimitiveBtn href="/set#reactiveweakset">ReactiveWeakSet</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="ReactiveSet">
              <SizeBadge
                value="505"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fset&treeshake=%5B%7BReactiveSet%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="ReactiveWeakSet">
              <SizeBadge
                value="536"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fset&treeshake=%5B%7BReactiveWeakSet%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/set.json"
              href="https://www.npmjs.com/package/@solid-primitives/set"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="share">share</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createSocialShare">
              <PrimitiveBtn href="/share#createsocialshare">createSocialShare</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createWebShare">
              <PrimitiveBtn href="/share#createwebshare">createWebShare</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createSocialShare">
              <SizeBadge
                value="748"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fshare&treeshake=%5B%7BcreateSocialShare%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createWebShare">
              <SizeBadge
                value="334"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fshare&treeshake=%5B%7BcreateWebShare%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/share.json"
              href="https://www.npmjs.com/package/@solid-primitives/share"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Reactivity</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="destructure">destructure</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="destructure">
              <PrimitiveBtn href="/destructure#destructure">destructure</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="destructure">
              <SizeBadge
                value="510"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fdestructure&treeshake=%5B%7Bdestructure%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/destructure.json"
              href="https://www.npmjs.com/package/@solid-primitives/destructure"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="memo">memo</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createLatest">
              <PrimitiveBtn href="/memo#createlatest">createLatest</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createWritableMemo">
              <PrimitiveBtn href="/memo#createwritablememo">createWritableMemo</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createLazyMemo">
              <PrimitiveBtn href="/memo#createlazymemo">createLazyMemo</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createAsyncMemo">
              <PrimitiveBtn href="/memo#createasyncmemo">createAsyncMemo</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createDebouncedMemo">
              <PrimitiveBtn href="/memo#createdebouncedmemo">createDebouncedMemo</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createDebouncedMemoOn">
              <PrimitiveBtn href="/memo#createdebouncedmemoon">createDebouncedMemoOn</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createThrottledMemo">
              <PrimitiveBtn href="/memo#createthrottledmemo">createThrottledMemo</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createPureReaction">
              <PrimitiveBtn href="/memo#createpurereaction">createPureReaction</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createMemoCache">
              <PrimitiveBtn href="/memo#creatememocache">createMemoCache</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createReducer">
              <PrimitiveBtn href="/memo#createreducer">createReducer</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createLatest">
              <SizeBadge
                value="213"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateLatest%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createWritableMemo">
              <SizeBadge
                value="304"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateWritableMemo%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createLazyMemo">
              <SizeBadge
                value="435"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateLazyMemo%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createAsyncMemo">
              <SizeBadge
                value="309"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateAsyncMemo%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createDebouncedMemo">
              <SizeBadge
                value="450"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateDebouncedMemo%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createDebouncedMemoOn">
              <SizeBadge
                value="477"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateDebouncedMemoOn%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createThrottledMemo">
              <SizeBadge
                value="599"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateThrottledMemo%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createPureReaction">
              <SizeBadge
                value="295"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreatePureReaction%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createMemoCache">
              <SizeBadge
                value="575"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateMemoCache%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createReducer">
              <SizeBadge
                value="192"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fmemo&treeshake=%5B%7BcreateReducer%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/memo.json"
              href="https://www.npmjs.com/package/@solid-primitives/memo"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="rootless">rootless</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createSubRoot">
              <PrimitiveBtn href="/rootless#createsubroot">createSubRoot</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createCallback">
              <PrimitiveBtn href="/rootless#createcallback">createCallback</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createDisposable">
              <PrimitiveBtn href="/rootless#createdisposable">createDisposable</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createSharedRoot">
              <PrimitiveBtn href="/rootless#createsharedroot">createSharedRoot</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createSubRoot">
              <SizeBadge
                value="301"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frootless&treeshake=%5B%7BcreateSubRoot%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createCallback">
              <SizeBadge
                value="130"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frootless&treeshake=%5B%7BcreateCallback%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createDisposable">
              <SizeBadge
                value="316"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frootless&treeshake=%5B%7BcreateDisposable%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createSharedRoot">
              <SizeBadge
                value="188"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frootless&treeshake=%5B%7BcreateSharedRoot%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/rootless.json"
              href="https://www.npmjs.com/package/@solid-primitives/rootless"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="signal-builders">signal-builders</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="List of builders">
              <PrimitiveBtn href="/signal-builders#list-of-builders">List of builders</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="Listofbuilders">
              <SizeBadge
                value="1.54"
                unit="KB"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fsignal-builders&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/signal-builders.json"
              href="https://www.npmjs.com/package/@solid-primitives/signal-builders"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="trigger">trigger</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createTrigger">
              <PrimitiveBtn href="/trigger#createtrigger">createTrigger</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createTriggerCache">
              <PrimitiveBtn href="/trigger#createtriggercache">createTriggerCache</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createTrigger">
              <SizeBadge
                value="259"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftrigger&treeshake=%5B%7BcreateTrigger%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createTriggerCache">
              <SizeBadge
                value="362"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftrigger&treeshake=%5B%7BcreateTriggerCache%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/trigger.json"
              href="https://www.npmjs.com/package/@solid-primitives/trigger"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Control Flow</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="keyed">keyed</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="keyArray">
              <PrimitiveBtn href="/keyed#keyarray">keyArray</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="Key">
              <PrimitiveBtn href="/keyed#key">Key</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="Entries">
              <PrimitiveBtn href="/keyed#entries">Entries</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="keyArray">
              <SizeBadge
                value="584"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyed&treeshake=%5B%7BkeyArray%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="Key">
              <SizeBadge
                value="655"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyed&treeshake=%5B%7BKey%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="Entries">
              <SizeBadge
                value="244"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fkeyed&treeshake=%5B%7BEntries%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/keyed.json"
              href="https://www.npmjs.com/package/@solid-primitives/keyed"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="range">range</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="repeat">
              <PrimitiveBtn href="/range#repeat">repeat</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="mapRange">
              <PrimitiveBtn href="/range#maprange">mapRange</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="indexRange">
              <PrimitiveBtn href="/range#indexrange">indexRange</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="Repeat">
              <PrimitiveBtn href="/range#repeat">Repeat</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="Range">
              <PrimitiveBtn href="/range#range">Range</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="IndexRange">
              <PrimitiveBtn href="/range#indexrange">IndexRange</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="repeat">
              <SizeBadge
                value="344"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frange&treeshake=%5B%7Brepeat%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="mapRange">
              <SizeBadge
                value="643"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frange&treeshake=%5B%7BmapRange%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="indexRange">
              <SizeBadge
                value="489"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frange&treeshake=%5B%7BindexRange%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="Repeat">
              <SizeBadge
                value="400"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frange&treeshake=%5B%7BRepeat%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="Range">
              <SizeBadge
                value="789"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frange&treeshake=%5B%7BRange%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="IndexRange">
              <SizeBadge
                value="637"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frange&treeshake=%5B%7BIndexRange%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/range.json"
              href="https://www.npmjs.com/package/@solid-primitives/range"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="refs">refs</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={2} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="mergeRefs">
              <PrimitiveBtn href="/refs#mergerefs">mergeRefs</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="resolveElements">
              <PrimitiveBtn href="/refs#resolveelements">resolveElements</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="resolveFirst">
              <PrimitiveBtn href="/refs#resolvefirst">resolveFirst</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="Ref">
              <PrimitiveBtn href="/refs#ref">Ref</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="Refs">
              <PrimitiveBtn href="/refs#refs">Refs</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="mergeRefs">
              <SizeBadge
                value="287"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frefs&treeshake=%5B%7BmergeRefs%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="resolveElements">
              <SizeBadge
                value="341"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frefs&treeshake=%5B%7BresolveElements%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="resolveFirst">
              <SizeBadge
                value="278"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frefs&treeshake=%5B%7BresolveFirst%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="Ref">
              <SizeBadge
                value="250"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frefs&treeshake=%5B%7BRef%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="Refs">
              <SizeBadge
                value="376"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Frefs&treeshake=%5B%7BRefs%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/refs.json"
              href="https://www.npmjs.com/package/@solid-primitives/refs"
            />
          </TD>
        </TR>

        <TR>
          <TD h4>Animation</TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
          <TD></TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="raf">raf</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createRAF">
              <PrimitiveBtn href="/raf#createraf">createRAF</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="targetFPS">
              <PrimitiveBtn href="/raf#targetfps">targetFPS</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createRAF">
              <SizeBadge
                value="294"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fraf&treeshake=%5B%7BcreateRAF%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="targetFPS">
              <SizeBadge
                value="224"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Fraf&treeshake=%5B%7BtargetFPS%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/raf.json"
              href="https://www.npmjs.com/package/@solid-primitives/raf"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="transition-group">transition-group</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={1} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createSwitchTransition">
              <PrimitiveBtn href="/transition-group#createswitchtransition">
                createSwitchTransition
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
            <PrimitiveBtnLineWrapper primitiveName="createListTransition">
              <PrimitiveBtn href="/transition-group#createlisttransition">
                createListTransition
              </PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createSwitchTransition">
              <SizeBadge
                value="431"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftransition-group&treeshake=%5B%7BcreateSwitchTransition%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
            <SizeBadgeWrapper primitiveName="createListTransition">
              <SizeBadge
                value="603"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftransition-group&treeshake=%5B%7BcreateListTransition%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/transition-group.json"
              href="https://www.npmjs.com/package/@solid-primitives/transition-group"
            />
          </TD>
        </TR>

        <TR>
          <TD>
            <PrimitiveBtn href="tween">tween</PrimitiveBtn>
          </TD>
          <TD>
            <StageBadge value={3} />
          </TD>
          <TD>
            <PrimitiveBtnLineWrapper primitiveName="createTween">
              <PrimitiveBtn href="/tween#createtween">createTween</PrimitiveBtn>
            </PrimitiveBtnLineWrapper>
          </TD>
          <TD>
            <SizeBadgeWrapper primitiveName="createTween">
              <SizeBadge
                value="279"
                unit="B"
                href="https://bundlejs.com/?q=%40solid-primitives%2Ftween&treeshake=%5B%7BcreateTween%7D%5D&config=%7B%22esbuild%22%3A%7B%22external%22%3A%5B%22solid-js%22%2C%22node-fetch%22%5D%7D%7D"
              />
            </SizeBadgeWrapper>
          </TD>
          <TD>
            <VersionBadge
              value="https://img.shields.io/npm/v/@solid-primitives/tween.json"
              href="https://www.npmjs.com/package/@solid-primitives/tween"
            />
          </TD>
        </TR>
      </tbody>
    </Table>
  );
};
export default PrimitivesTable;
