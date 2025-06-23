import { arrayMoveImmutable } from "array-move";
// import { getAccessToken } from "../soundcloudAuth.js";
import { addToQueue, getAccessToken } from "../utils/soundcloudUtils.js";
import "dotenv/config";

let keyTracker = 1;
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

// Temporary test queue
let link = "https://google.com";
let queue = [];
let key = 0;
// let queue = [
// 	createNewSongInfo(
// 		"https://soundcloud.com/djshadow/building-steam-with-a-grain-2",
// 		"https://soundcloud.com/djshadow/building-steam-with-a-grain-2",
// 		"Building Steam with a Grain of Salt",
// 		"DJ Shadow",
// 		399,
// 		"https://i1.sndcdn.com/artworks-aQmuuZePnaRi-0-large.jpg",
// 		1,
// 	),
// ];

export default function setupQueueLogic(socket, io) {
	// Send the current queue to the newly connected client
	socket.emit("updateQueue", queue);

	// Add song
	socket.on("addSong", async (url, callback) => {
		// Reauthenticate
		const token = await getAccessToken();
		try {
			// Get track information from soundcloud URL
			const res = await fetch(
				`https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`,
				{
					headers: { Authorization: `OAuth ${token}` },
				},
			);

			if (!res.ok) {
				const body = await res.text();
				console.log(res.status);
				if (res.status == 404) {
					callback({
						success: false,
						error:
							"Couldn't find anything at that address. Is it a valid SoundCloud link?",
					});
				}
				throw new Error(`SC resolve failed: ${res.status} ${body}`);
				return;
			}

			callback({ success: true });

			const resJSON = await res.json();
			// Add new song to the queue
			queue = await addToQueue(resJSON, queue, token, keyTracker);
			keyTracker++;
			callback({ success: true });
			io.emit("updateQueue", queue);
		} catch (err) {
			console.log(err);
			return;
		}
	});

	// Delete song by ID
	socket.on("deleteSong", (id) => {
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		let targetIndex = keyList.indexOf(id);

		queue = queue.toSpliced(targetIndex, 1);

		io.emit("updateQueue", queue);
	});

	socket.on("reorderQueue", (fromKey, toIndex) => {
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		// This is done in case the index of the from item changes mid-drag
		let fromIndex = keyList.indexOf(fromKey);
		queue = arrayMoveImmutable(queue, fromIndex, toIndex);

		io.emit("updateQueue", queue);
	});

	socket.emit("addSong", "https://soundcloud.com/massiveattack/inertia-creeps");
}
