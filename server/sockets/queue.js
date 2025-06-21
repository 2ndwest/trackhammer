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
let keyTracker = 9;

// Temporary test queue
let ctrl_alt_reality = "ctrl-alt-reality.jpg";
let link = "https://google.com";
let queue = [
	createNewSongInfo(
		"https://soundcloud.com/djshadow/building-steam-with-a-grain-2",
		"Building Steam with a Grain of Salt",
		"DJ Shadow",
		399,
		"endtroducing.jpg",
		1,
	),
	createNewSongInfo(
		"https://soundcloud.com/theglitchmob/the-glitch-mob-depth-charge",
		"Depth Charge",
		"The Glitch Mob",
		394,
		"ctrl-alt-reality.jpg",
		2,
	),
	createNewSongInfo(
		"https://soundcloud.com/jonhopkins/the-wider-sun-vessel",
		"Vessel",
		"Jon Hopkins",
		282,
		"insides.jpg",
		3,
	),
	createNewSongInfo(
		"https://soundcloud.com/massiveattack/inertia-creeps-remastered-2018",
		"Inertia Creeps",
		"Massive Attack",
		357,
		"mezzanine.jpg",
		4,
	),
	createNewSongInfo(
		"https://soundcloud.com/moderat-official/undo-redo-1",
		"UNDO REDO",
		"Moderat",
		278,
		"more-data.jpg",
		5,
	),
	createNewSongInfo(
		"https://soundcloud.com/yunna-music/ride-out",
		"Ride Out",
		"Yunna",
		288,
		"the-arrival.jpg",
		6,
	),
	createNewSongInfo(
		"https://soundcloud.com/burial-uk-1/archangel",
		"Archangel",
		"Burial",
		238,
		"untrue.jpg",
		7,
	),
	createNewSongInfo(
		"https://soundcloud.com/kettamabro/kettama-interplanetary-criminal-yosemite-1",
		"Yosemite",
		"Kettama",
		362,
		"yosemite.jpg",
		8,
	),
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
