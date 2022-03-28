import { Component } from "solid-js";
import { render } from "solid-js/web";
import { anyMaskToFn, createInputMask } from '../src';

const App: Component = () => {
  const ibanMask = anyMaskToFn('aa99999999999999999999');
  return (
    <div class="p-24 box-border w-full min-h-screen flex flex-col justify-center items-center space-y-4 bg-gray-800 text-white">
      <div class="wrapper-v">
        <h4>Input Mask</h4>
        <label for="isodate">ISO Date:</label>
        <input type="text" id="isodate" placeholder="YYYY-MM-DD" onInput={createInputMask('9999-99-99')} /><br />
        <label for="cardexpiry">Card Expiry:</label>
        <input type="text" id="cardexpiry" placeholder="MM/YYYY" onInput={createInputMask('99/9999')} /><br />
        <label for="iban" title="International Banking Accound Number">IBAN:</label>
        <input type="text" id="iban" placeholder="XX0000000000000000000000" onInput={createInputMask((value, selection) => {
          const maskOutput = ibanMask(value, selection)
          maskOutput[0] = maskOutput[0].toUpperCase();
          return maskOutput;
        })} /><br />
      </div>
    </div>
  );
};

render(() => <App />, document.getElementById("root")!);
