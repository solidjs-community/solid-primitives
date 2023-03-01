export const KILL: WorkerSignal = 0;
export const RPC: WorkerSignal = 1;

/**
 * Binds the message event and other setup tasks to the worker context.
 *
 * @param ctx Worker that will be setup.
 * @param rpcMethods RPC methods that should be bound to the worker.
 * @param callbacks Callbacks that will be bound to the worker.
 */
export function setup(
  ctx: Worker,
  rpcMethods: { [key: string]: Function },
  callbacks: WorkerCallbacks,
) {
  const handler = ({ data }: { data: WorkerMessage }) => {
    const id = data.id;
    if (data.type !== 1 || id == null) return;
    if (data.method) {
      const method = rpcMethods[data.method];
      if (method == null) {
        ctx.postMessage({
          id,
          type: 1,
          error: "NO_SUCH_METHOD",
        });
      } else {
        const post = (result?: string, error?: string) =>
          ctx.postMessage({ id, type: 1, result, error });
        Promise.resolve()
          .then(() => method.apply(null, data.params))
          .then(result => post(result))
          .catch(err => post(undefined, `${err}`));
      }
    } else {
      if (!callbacks.get(id)) return;
      if (data.error) {
        callbacks.get(id)![1](Error(data.error));
      } else {
        callbacks.get(id)![0](data.result);
      }
      callbacks.delete(id);
    }
  };
  ctx.addEventListener("message", handler);
}

/**
 * Converst raw code to CJS useable output.
 *
 * @param code Code to generate into CJS compliant.
 * @param exportsObjName Object names to export
 * @param exports Actual export values
 * @returns String to return with CJS values.
 */
export function cjs(code: string, exportsObjName: string, exports: Set<string>): string {
  code = code.replace(
    /^(\s*)export\s+((?:async\s*)?function(?:\s*\*)?|const|let|var)(\s+)([a-zA-Z$_][a-zA-Z0-9$_]*)/gm,
    (_, before, type, ws, name) => {
      exports.add(name);
      return `${before}${exportsObjName}.${name}=${type}${ws}${name}`;
    },
  );
  return `var ${exportsObjName}={};\n${code}\n${exportsObjName};`;
}
