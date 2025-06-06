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
	constructor(link, track, artist, duration, cover, id) {
		this.link = link;
		this.track = track;
		this.artist = artist;
		this.duration = duration;
		this.cover = cover;
		this.id = id;
	}
}

export default function App() {
	// BACKEND TESTING VARIABLES SECTION:
	// TO BE REMOVED LATER
	let [queue, setQueue] = useState([
		new songInfo("Link1", "FE!N", "Travis Scott", "2:00", ctrl_alt_reality, 1),
		new songInfo("Link2", "Gangnam Style", "Psy", "3:00", ctrl_alt_reality, 2),
		new songInfo("Link3", "Jungle", "Fred Again", "2:00", ctrl_alt_reality, 3),
		new songInfo("Link4", "Orca", "Bicep", "1:00:00", ctrl_alt_reality, 4),
	]);

	// Series of callbacks for modifying the queue:

	// Function for swapping songs in the queue:
	function moveItem(startIndex, endIndex) {
		const newQueue = arrayMoveImmutable(queue, startIndex, endIndex);
		setQueue(newQueue);
	}

	return (
		<div className="App">
			<PTZHeader />
			<URLInput />
			<Player songInfo={queue[0]} />
			<Queue queue={queue} changeQueueCallback={moveItem} />
		</div>
	);
}
