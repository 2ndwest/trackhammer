import setupQueueLogic from "./sockets/queue.js";
import http from "http";
import fs from "fs";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import { Server as SocketIOServer } from "socket.io";
import { socketCors } from "./middleware/devCors.js";

// Set up directory information
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
console.log(publicDir);

// Set up server logic
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: socketCors,
});

// Serve public directory using express
app.use(express.static(publicDir));

const PORT = 3001;

io.on("connection", (socket) => {
	setupQueueLogic(socket, io);
});

// Start the server:
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
