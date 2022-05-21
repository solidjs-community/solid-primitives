import { RequestContext } from "./socket";

export type RequestModifier = <T>(...args: any[]) => (requestContext: RequestContext<T>) => any;

export const withReconnect = <T>(
  requestContext: RequestContext<T>,
  retryLimit: number = Infinity,
  retryInterval: number = 500
) => {
  let reconnections = 0;
  let reconnectId: number;
  const cancelReconnect = () => {
    if (reconnectId) {
      clearTimeout(reconnectId);
    }
  };
};
