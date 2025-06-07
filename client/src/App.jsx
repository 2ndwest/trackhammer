import "./App.css";
import PTZHeader from "./components/header/PTZHeader.jsx";
import URLInput from "./components/urlinput/URLInput.jsx";
import Queue from "./components/queue/Queue.jsx";
import Player from "./components/player/Player.jsx";
import { useState } from "react";
import { arrayMoveImmutable } from "array-move";

// Testing purposes only:
import ctrl_alt_reality from "./resources/ctrl-alt-reality.jpg";

class songInfo {
	constructor(link, track, artist, duration, cover, key) {
		this.link = link;
		this.track = track;
		this.artist = artist;
		this.duration = duration;
		this.cover = cover;
		this.key = key;
	}
}

export default function App() {
	// BACKEND TESTING VARIABLES SECTION:
	// TO BE REMOVED LATER
	let [queue, setQueue] = useState([
		new songInfo("Link2", "A", "Psy", "3:00", ctrl_alt_reality, "A"),
		new songInfo("Link3", "B", "Fred Again", "2:00", ctrl_alt_reality, "B"),
		new songInfo("Link4", "C", "Bicep", "1:00:00", ctrl_alt_reality, "C"),
		new songInfo("Link2", "D", "Psy", "3:00", ctrl_alt_reality, "D"),
		new songInfo("Link3", "E", "Fred Again", "2:00", ctrl_alt_reality, "E"),
		new songInfo("Link4", "F", "Bicep", "1:00:00", ctrl_alt_reality, "F"),
		new songInfo("Link2", "G", "Psy", "3:00", ctrl_alt_reality, "G"),
		new songInfo("Link3", "H", "Fred Again", "2:00", ctrl_alt_reality, "H"),
		new songInfo("Link4", "I", "Bicep", "1:00:00", ctrl_alt_reality, "I"),
		new songInfo("Link0", "J", "Throne", "2:00:00", ctrl_alt_reality, "J"),
	]);

	// Series of callbacks for modifying the queue:

	// Function for swapping songs in the queue:
	// Takes the keys passed, finds the indices of corresponding objects,
	// and then moves the first object to the second position.
	function changeQueueCallback(fromKey, toKey) {
		// Get a list keys in queue
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		// Find the indices of each key
		let fromIndex = keyList.indexOf(fromKey);
		let toIndex = keyList.indexOf(toKey);

		console.log("fromKey: " + fromKey);
		console.log("toKey: " + toKey);

		const newQueue = arrayMoveImmutable(queue, fromIndex, toIndex);
		setQueue(newQueue);
	}

	function shrinkQueueCallback(targetKey) {
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		let targetIndex = keyList.indexOf(targetKey);

		setQueue(queue.toSpliced(targetIndex, 1));
	}

	return (
		<div className="App">
			<PTZHeader />
			<URLInput />
			<Player songInfo={queue[0]} />
			<Queue
				queue={queue}
				changeQueueCallback={changeQueueCallback}
				shrinkQueueCallback={shrinkQueueCallback}
			/>
		</div>
	);
}
