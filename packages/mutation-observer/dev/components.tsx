import { Component, createSignal, For, JSX, Show, splitProps } from "solid-js";

export const TestingNode: Component<{ output?: JSX.Element; heading?: string }> = props => {
  return (
    <div class="bg-gray-900 rounded-lg border-1 border-gray-800">
      <Show when={props.heading}>
        <div class="border-0 border-b border-gray-800 py-3 px-6 center-child">
          <h5>{props.heading}</h5>
        </div>
      </Show>
      <div class="p-6 flex flex-col items-center space-y-2">{props.children}</div>
      <Show when={props.output}>
        <div class="border-0 border-t border-gray-800 p-3 flex flex-col items-center space-y-1 text-xs font-mono text-gray-500 leading-tight">
          {props.output}
        </div>
      </Show>
    </div>
  );
};

export const ToggleBtn: Component<
  { state: boolean } & JSX.HTMLAttributes<HTMLButtonElement>
> = props => {
  const [, attrs] = splitProps(props, ["children", "state"]);
  return (
    <button
      class="bg-gray-700 text-gray-100 w-6 h-6 center-child select-none cursor-pointer rounded border-1 border-gray-600 hover:bg-gray-600"
      classList={{
        "!bg-green-700 border-green-600 !hover:bg-green-600": props.state,
      }}
      {...attrs}
    >
      {props.children}
    </button>
  );
};

export const DisplayRecord: Component<{ record: Record<string, any> }> = props => (
  <div>
    <For each={Object.keys(props.record)}>
      {k => (
        <p>
          {k}: {String(props.record[k])}
        </p>
      )}
    </For>
  </div>
);

export const LogMutationRecord: Component<{
  setupLogFunc: (fn: (e: MutationRecord) => void) => void;
}> = props => {
  const [last, setLast] = createSignal<{
    type?: string;
    removedNodes?: number;
    addedNodes?: number;
    attributeName?: string;
    oldValue?: string;
  }>({
    type: undefined,
    removedNodes: undefined,
    addedNodes: undefined,
    attributeName: undefined,
    oldValue: undefined,
  });

  const log = (e: MutationRecord) => {
    setLast({
      type: e.type,
      removedNodes: e.removedNodes.length,
      addedNodes: e.addedNodes.length,
      attributeName: e.attributeName,
      oldValue: e.oldValue,
    });
  };

  props.setupLogFunc(log);

  return <DisplayRecord record={last()} />;
};
