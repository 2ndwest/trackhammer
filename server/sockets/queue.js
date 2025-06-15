import { arrayMoveImmutable } from "array-move";

// Populate dummy queue
function createNewSongInfo(link, track, artist, duration, coverPath, key) {
	return {
		link: link,
		track: track,
		artist: artist,
		duration: duration,
		coverPath: coverPath,
		key: key,
	};
}
let keyTracker = 5;

// Temporary test queue
let ctrl_alt_reality = "ctrl-alt-reality.jpg";
let link = "https://google.com";
let queue = [
	createNewSongInfo(link, "FE!N", "Travis Scott", 120, ctrl_alt_reality, 1),
	createNewSongInfo(link, "Gangnam Style", "Psy", 210, ctrl_alt_reality, 2),
	createNewSongInfo(link, "Jungle", "Fred Again", 400, ctrl_alt_reality, 3),
	createNewSongInfo(link, "Orca", "Bicep", 3657, ctrl_alt_reality, 4),
];

export default function setupQueueLogic(socket, io) {
	// Send the current queue to the newly connected client
	socket.emit("updateQueue", queue);

	// Add song
	socket.on("addSong", (url, callback) => {
		try {
			queue.push(
				createNewSongInfo(
					url,
					"Test Song",
					"SNTS",
					300,
					"ctrl-alt-reality.jpg",
					keyTracker,
				),
			);

			keyTracker++;
			console.log(url);
			callback({ success: true });
		} catch (err) {
			callback({ success: false, error: err.message });
		}
		io.emit("updateQueue", queue);
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
}
