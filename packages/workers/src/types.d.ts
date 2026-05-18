export type WorkerSignal = number;

export type WorkerCallbacks = Map<string, [succes: Function, error: Function]>;

export type WorkerMessage = {
  type: WorkerSignal;
  id?: string;
  error?: string;
  method?: string;
  signal?: string | number;
  result?: string;
  params?: any;
};

export type WorkerExports = [
  worker: Worker,
  start: () => void,
  stop: () => void,
  exports?: Set<string>,
];

export interface PostMessageOptions {
  transfer?: any[] | undefined;
}

export type BridgeMessage =
  | { type: "init"; inputs: Record<string, unknown>; outputs: Record<string, unknown> }
  | { type: "input"; key: string; value: unknown }
  | { type: "outputs"; snapshot: Record<string, unknown> };
