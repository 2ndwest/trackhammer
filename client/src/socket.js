// src/socket.js
import { io } from "socket.io-client";

const socket = io({
	autoConnect: false,
	transports: ["websocket", "polling"],
});

export default socket;
