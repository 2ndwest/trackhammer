import setupQueueLogic from "./sockets/queue.js";
import setupPlaybackLogic from "./sockets/playback.js";
import setupSoundCloudRoute from "./routes/soundcloudRoutes.js";
import { fileURLToPath } from "url";
import https from "https";
import fs from "fs";
import cors from "cors";
import path from "path";
import express from "express";
import "dotenv/config";
import { Server as SocketIOServer } from "socket.io";

// Set up directory information
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");

// Set up certification stuff for serving over https
const certOptions = {
	key: fs.readFileSync("./trackhammer.mit.edu+3-key.pem"),
	cert: fs.readFileSync("./trackhammer.mit.edu+3.pem"),
};

// Set up server logic
const app = express();
const server = https.createServer(certOptions, app);
const io = new SocketIOServer(server);
setupSoundCloudRoute(app);

// Serve public directory using express
app.use(express.static(publicDir));

const PORT = 443;

io.on("connection", (socket) => {
	setupQueueLogic(socket, io);
	setupPlaybackLogic(socket, io);
});

// Start the server:
server.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});
