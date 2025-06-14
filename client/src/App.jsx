import "./App.css";
import PTZHeader from "./components/header/PTZHeader.jsx";
import URLInput from "./components/urlinput/URLInput.jsx";
import Queue from "./components/queue/Queue.jsx";
import Player from "./components/player/Player.jsx";
import socket from "./socket.js";
import { useState, useEffect } from "react";
import { arrayMoveImmutable } from "array-move";

export default function App() {
	let [queue, setQueue] = useState([]);

	// On connection, get queue from server
	useEffect(() => {
		// Receive updates from the server
		socket.on("updateQueue", setQueue);

		// Optional: cleanup listener on unmount
		return () => socket.off("updateQueue");
	}, []);

	// Series of callbacks for modifying the queue:

	// Function for swapping songs in the queue:
	// Takes the keys passed, finds the indices of corresponding objects,
	// and then moves the first object to the second position.
	function changeQueueCallback(fromKey, toIndex) {
		// Get a list keys in queue
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		// Find the indices of each key
		let fromIndex = keyList.indexOf(fromKey);

		const newQueue = arrayMoveImmutable(queue, fromIndex, toIndex);
		setQueue(newQueue);
	}

	// Removes an item item from the queue based on key
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
