declare type WorkerSignal = number;

declare type WorkerCallbacks = Map<string, [succes: Function, error: Function]>;

declare type WorkerMessage = {
  type: WorkerSignal;
  id?: string;
  error?: string;
  method?: string;
  signal?: string | number;
  result?: string;
  params?: any;
};

declare type WorkerExports = [
  worker: Worker,
  start: () => void,
  stop: () => void,
  exports?: Set<string>
];

declare interface PostMessageOptions {
  transfer?: any[] | undefined
}
