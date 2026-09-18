import { io } from "socket.io-client";
import config from "../config";

let socket = null;

export function getSocket() {
  if (!socket) {
    const token = localStorage.getItem("ye_token");
    socket = io(config.socketUrl, {
      auth: { token },
      autoConnect: true,
    });
  }
  return socket;
}
