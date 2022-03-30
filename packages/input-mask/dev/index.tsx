import { Component } from "solid-js";
import { render } from "solid-js/web";
import { anyMaskToFn, createInputMask, Selection } from '../src';

const App: Component = () => {
  const isoDateHandler = createInputMask('9999-99-99');
  const cardExpiryHandler = createInputMask('99/9999');
  const ibanMask = anyMaskToFn('aa99999999999999999999');
  const ibanHandler = createInputMask((value, selection) => {
    const maskOutput = ibanMask(value, selection)
    maskOutput[0] = maskOutput[0].toUpperCase();
    return maskOutput;
  })
  const meetingIdMask = anyMaskToFn('999-999-999');
  const gotoURLs = /^(https?:\/\/|)(meet\.goto\.com|gotomeet\.me|)\/?/;
  const removeGotoURLMask = (value: string, selection: Selection): [string, Selection] => {
    const cleanedValue = value.replace(gotoURLs, '');
    const removed = value.length - cleanedValue.length;    
    return cleanedValue === value
      ? [value, selection]
      : [cleanedValue, [Math.max(selection[0] - removed, 0), Math.max(selection[1] - removed, 0)]]
  }
  const meetingMask = (value: string, selection: Selection): [string, Selection] => /^\D/.test(value)
    ? removeGotoURLMask(value, selection)
    : meetingIdMask(value, selection)
  const meetingInputHandler = createInputMask(meetingMask)

  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Input Mask</h4>
        <label for="isodate">ISO Date:</label>
        <input type="text" id="isodate" placeholder="YYYY-MM-DD" onInput={isoDateHandler} onPaste={isoDateHandler} /><br />
        <label for="cardexpiry">Card Expiry:</label>
        <input type="text" id="cardexpiry" placeholder="MM/YYYY" onInput={cardExpiryHandler} onPaste={isoDateHandler} /><br />
        <label for="iban" title="International Banking Accound Number">IBAN:</label>
        <input type="text" id="iban" placeholder="XY12324400000000012345" onInput={ibanHandler} onPaste={isoDateHandler} /><br />
        <label for="gotomeeting">GoToMeeting:</label>
        <input type="text" id="gotomeeting" placeholder="000-000-000 or meeting name" onInput={meetingInputHandler} onPaste={meetingInputHandler} /><br />
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
