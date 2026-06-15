import type { WorkerCallbacks, WorkerMessage } from "./types.js";

export const RPC: number = 1;

/**
 * Binds a message handler to ctx for RPC dispatch (worker side) and response
 * resolution (main-thread side). Returns a cleanup that removes the listener,
 * preventing stale handlers if start() is called more than once.
 */
export function setup(
  ctx: Worker,
  rpcMethods: { [key: string]: Function },
  callbacks: WorkerCallbacks,
): () => void {
  const controllers = new Map<string, AbortController>();

  const handler = ({ data }: { data: WorkerMessage }) => {
    const id = data.id;
    if (data.type !== RPC || id == null) return;

    if (data.cancel) {
      controllers.get(id)?.abort();
      controllers.delete(id);
      return;
    }

    if (data.method) {
      const method = rpcMethods[data.method];
      if (method == null) {
        ctx.postMessage({ id, type: RPC, error: "NO_SUCH_METHOD" });
      } else {
        const controller = new AbortController();
        controllers.set(id, controller);
        const post = (result?: unknown, error?: string) => {
          if (!controllers.has(id)) return; // already cancelled
          controllers.delete(id);
          ctx.postMessage({ id, type: RPC, result, error });
        };
        Promise.resolve()
          .then(() => method.apply(null, [...(data.params as unknown[]), controller.signal]))
          .then(result => post(result))
          .catch(err => post(undefined, `${err}`));
      }
    } else {
      const cb = callbacks.get(id);
      if (!cb) return;
      if (data.error) {
        cb[1](Error(data.error));
      } else {
        cb[0](data.result);
      }
      callbacks.delete(id);
    }
  };
  ctx.addEventListener("message", handler);
  return () => ctx.removeEventListener("message", handler);
}

/**
 * Serializes a record of named functions into a self-contained worker script.
 * All functions are inlined via Function.prototype.toString — they must be
 * self-contained (no closures, no imports).
 */
export function buildWorkerCode(fns: Record<string, Function>, exports: Set<string>): string {
  const exportObj = `__xpo${Math.random().toString(36).substring(2)}__`;
  let code = `var ${exportObj}={};\n`;
  for (const name of Object.keys(fns)) {
    exports.add(name);
    code += `${exportObj}[${JSON.stringify(name)}]=(${Function.prototype.toString.call(fns[name]!)});\n`;
  }
  code += `var RPC=${RPC};\n`;
  code += `(${Function.prototype.toString.call(setup)})(self,${exportObj},{});\n`;
  return code;
}
