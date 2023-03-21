import { Component, createSignal, For, JSX, Show, splitProps } from "solid-js";

export const TestingNode: Component<{ output?: JSX.Element; heading?: string }> = props => {
  return (
    <div class="border-1 rounded-lg border-gray-800 bg-gray-900">
      <Show when={props.heading}>
        <div class="center-child border-0 border-b border-gray-800 py-3 px-6">
          <h5>{props.heading}</h5>
        </div>
      </Show>
      <div class="flex flex-col items-center space-y-2 p-6">{props.children}</div>
      <Show when={props.output}>
        <div class="flex flex-col items-center space-y-1 border-0 border-t border-gray-800 p-3 font-mono text-xs leading-tight text-gray-500">
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
      class="center-child border-1 h-6 w-6 cursor-pointer select-none rounded border-gray-600 bg-gray-700 text-gray-100 hover:bg-gray-600"
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
