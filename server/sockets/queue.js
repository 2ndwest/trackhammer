import { arrayMoveImmutable } from "array-move";
import {
	addToQueue,
	getAccessToken,
	getJSON,
	downloadTrack,
} from "../utils/soundcloudUtils.js";
import { notifyPlayer } from "./playback.js";
import "dotenv/config";
import fs from "fs";

const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const TRACK_DIR = process.cwd() + "/tracks/";
let queue = [];
let currentlyDownloading = [];
let keyTracker = 0;
let io = null;

async function addItem(url, callback) {
	// Reauthenticate
	const token = await getAccessToken();
	try {
		let { status, resJSON } = await getJSON(url, token);
		const success = sendClientCallback(callback, status, resJSON);
		if (!success) return;

		// Add new song to the queue
		queue = addToQueue(resJSON, queue, token, keyTracker);
		io.emit("updateQueue", queue);
		keyTracker++;
		console.log("Appended a new song to the queue");
		console.log(queue[queue.length - 1]);

		let tracks = fs.readdirSync(TRACK_DIR);
		let isCurrentlyDownloading = currentlyDownloading.includes(resJSON.title);

		queue.forEach(async (songInfo) => {
			// Return if already downloaded or downloading
			if (tracks.includes(songInfo.track + ".mp3")) return;
			if (currentlyDownloading.includes(songInfo.track)) return;

			currentlyDownloading.push(songInfo.track);
			await downloadTrack(songInfo);
			currentlyDownloading = currentlyDownloading.filter(
				(e) => e !== songInfo.track,
			);
			console.log("Notifying Player");
			notifyPlayer();
		});
	} catch (err) {
		console.log(err);
		return;
	}
	notifyPlayer();
}

// Process return from getJSON and inform client approrpiately
function sendClientCallback(callback, status, resJSON) {
	if (status === 0) {
		// Process the type of link:
		if (!(resJSON.kind === "track" || resJSON.kind === "playlist")) {
			callback({
				success: false,
				error: "Please submit a link to a track or playlist.",
			});
			return false;
		} else {
			callback({ success: true });
			return true;
		}
	} else if (status === 404) {
		callback({
			success: false,
			error:
				"Couldn't find anything at that address. Is it a valid SoundCloud link?",
		});
		throw new Error(`SC resolve failed}`);
		return false;
	} else {
		callback({ success: false });
		return false;
	}
}

// For use when the client wants to delete a song
function deleteSong(id) {
	let keyList = [];
	queue.forEach((queueItem) => {
		keyList.push(queueItem.key);
	});

	let targetIndex = keyList.indexOf(id);

	queue = queue.toSpliced(targetIndex, 1);

	io.emit("updateQueue", queue);
}

function reorderQueue(fromKey, toIndex) {
	let keyList = [];
	queue.forEach((queueItem) => {
		keyList.push(queueItem.key);
	});

	// This is done in case the index of the from item changes mid-drag
	let fromIndex = keyList.indexOf(fromKey);
	queue = arrayMoveImmutable(queue, fromIndex, toIndex);

	io.emit("updateQueue", queue);
}

// For use when the player wants to play the next song
export function getNextSong() {
	// Return false if there is no next song
	if (queue[0] == undefined) return false;

	// Check if next track is ready
	// If it's not, it'll play when addItem() calls notifyPlayer()
	let tracks = fs.readdirSync(TRACK_DIR);
	if (!tracks.includes(queue[0].track + ".mp3")) return false;

	// Otherwise shift the songInfo out of the queue and return it
	const removedSong = queue.shift();
	io.emit("updateQueue", queue);
	return removedSong;
}

export default function setupQueueLogic(socket, ioInput) {
	io = ioInput;
	// Send the current queue to the newly connected client
	socket.emit("updateQueue", queue);

	// Add song
	socket.on("addSong", async (url, callback) => {
		await addItem(url, callback);
	});

	// Delete song by ID
	socket.on("deleteSong", (id) => {
		deleteSong(id);
	});

	socket.on("reorderQueue", (fromKey, toIndex) => {
		reorderQueue(fromKey, toIndex);
	});
}
