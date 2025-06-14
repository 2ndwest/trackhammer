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
let queue = [
	createNewSongInfo(
		"Link1",
		"FE!N",
		"Travis Scott",
		"2:00",
		ctrl_alt_reality,
		1,
	),
	createNewSongInfo(
		"Link2",
		"Gangnam Style",
		"Psy",
		"3:00",
		ctrl_alt_reality,
		2,
	),
	createNewSongInfo(
		"Link3",
		"Jungle",
		"Fred Again",
		"2:00",
		ctrl_alt_reality,
		3,
	),
	createNewSongInfo("Link4", "Orca", "Bicep", "1:00:00", ctrl_alt_reality, 4),
];

export default function setupQueueSocket(socket, io) {
	// Send the current queue to the newly connected client
	socket.emit("updateQueue", queue);

	// Add song
	socket.on("addSong", (url, callback) => {
		try {
			queue.push(
				createNewSongInfo(
					"Link5",
					"K",
					"SNTS",
					"5:55",
					"/resources/ctrl-alt-reality.jpg",
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
		queue = queue.filter((song) => song.id !== id);
		io.emit("updateQueue", queue);
		console.log("Delete Operation");
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
		console.log("Reoder Operation");
	});
}
