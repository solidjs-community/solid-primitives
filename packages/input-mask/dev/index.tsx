import { Component } from "solid-js";

import { anyMaskToFn, createInputMask, maskArrayToFn, Selection } from "../src";

const App: Component = () => {
  // ISO Date
  const isoDateHandler = createInputMask("9999-99-99");

  // Card Expiry Date
  const cardExpiryHandler = createInputMask([/\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]);

  // IBAN
  const ibanMask = anyMaskToFn("aa99999999999999999999");
  const ibanHandler = createInputMask((value, selection) => {
    const maskOutput = ibanMask(value, selection);
    maskOutput[0] = maskOutput[0].toUpperCase();
    return maskOutput;
  });

  // GoToMeeting
  const potentialNumericId = /^\d{1,3}$|^\d{2,4}-?\d{0,3}$|^\d{2,4}-?\d{2,4}-?\d{0,3}$/;
  const meetingIdMask = anyMaskToFn("999-999-999");
  const meetingNameMask = anyMaskToFn([
    /[^0-9a-zäöüß\-_/]|^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/gi,
    () => "",
  ]);
  const meetingMask = (value: string, selection: Selection): [string, Selection] =>
    potentialNumericId.test(value)
      ? meetingIdMask(value, selection)
      : meetingNameMask(value, selection);
  const meetingInputHandler = createInputMask(meetingMask);

  // Hex Color
  const hexMask = maskArrayToFn(["#", /[0-9a-f]{0,6}/i]);
  const hexHandler = createInputMask(hexMask);

  return (
    <div class="box-border flex min-h-screen w-full flex-col items-center justify-center space-y-4 bg-gray-800 p-24 text-white">
      <div class="wrapper-v items-start">
        <h4>Input Mask</h4>
        <label for="isodate">ISO Date:</label>
        <input
          type="text"
          id="isodate"
          placeholder="YYYY-MM-DD"
          onInput={isoDateHandler}
          onPaste={isoDateHandler}
        />
        <br />
        <label for="cardexpiry">Card Expiry:</label>
        <input
          type="text"
          id="cardexpiry"
          placeholder="MM/YYYY"
          onInput={cardExpiryHandler}
          onPaste={isoDateHandler}
        />
        <br />
        <label for="iban" title="International Banking Account Number">
          IBAN:
        </label>
        <input
          type="text"
          id="iban"
          placeholder="XY12324400000000012345"
          onInput={ibanHandler}
          onPaste={isoDateHandler}
        />
        <br />
        <label for="gotomeeting">GoToMeeting:</label>
        <input
          type="text"
          id="gotomeeting"
          placeholder="000-000-000 or meeting name"
          onInput={meetingInputHandler}
          onPaste={meetingInputHandler}
        />
        <br />
        <label for="hex">Hex:</label>
        <input
          type="text"
          id="hex"
          placeholder="#000000"
          onInput={hexHandler}
          onPaste={hexHandler}
        />
        <br />
      </div>
    </div>
  );
};

export default App;
