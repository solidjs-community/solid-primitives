import { SocketContext } from "./socket";

export type SocketModifier = (...args: any[]) => (requestContext: SocketContext) => any;

export const withReconnect = (
  socketContext: SocketContext,
  reconnectLimit: number = Number.POSITIVE_INFINITY,
  reconnectInterval: number = 500
) => {
  let { socket, connect, disconnecting } = socketContext;
  let reconnections = 0;
  let reconnectId: number;
  disconnecting = () => {
    if (reconnectId) {
      clearTimeout(reconnectId);
    }
  };
  socket.onclose = () => {
    if (reconnectLimit && reconnectLimit > reconnections) {
      reconnections += 1;
      reconnectId = setTimeout(connect!, reconnectInterval);
    }
  };
};
