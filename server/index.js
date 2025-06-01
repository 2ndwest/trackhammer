import express from "express";
import http from "http";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

// Create the server app with Express
var app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});
const PORT = process.env.PORT || 3001;

// Tell Express to parse incoming JSON bodies:
app.use(express.json());

// Allows this server to get requests coming in to port 3000
// Helpful for development when client/server are on same machine
app.use(cors({ origin: "http://localhost:3000" }));

// Define the queue of linksport
var queue = [];

// POST handler
app.post("/api/queue", (req, res) => {
	const { url } = req.body; // Express automatically parses JSON
	if (!url) return res.status(400).json({ error: "Missing url" });
	queue.push(url);
	console.log(queue);
	return res.status(201).json(queue);
});

// GET Handler
app.get("/api/queue", (req, res) => {
	return res.json(queue);
});

server.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
