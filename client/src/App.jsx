import "./App.css";
import PTZHeader from "./components/header/PTZHeader.jsx";
import URLInput from "./components/urlinput/URLInput.jsx";
import Queue from "./components/queue/Queue.jsx";
import Player from "./components/player/Player.jsx";
import { useState, useEffect } from "react";
import socket from "./socket.js";
import { arrayMoveImmutable } from "array-move";

export default function App() {
	let [queue, setQueue] = useState([]);

	// Get queue from server
	useEffect(() => {
		// Receive updates from the server
		socket.on("updateQueue", setQueue);
		socket.connect();
		return () => socket.off("updateQueue");
	}, []);

	// Define callback for reodering queue
	// 1. Sends change to server
	// 2. Implements the change clientside immediately
	// 3. Queue automatically updates to match server
	// This way it feels snappy and always stays synced.
	function reorderQueueCallback(fromKey, toIndex) {
		socket.emit("reorderQueue", fromKey, toIndex);
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		// This is done in case the index of the from item changes mid-drag
		let fromIndex = keyList.indexOf(fromKey);
		setQueue(arrayMoveImmutable(queue, fromIndex, toIndex));
	}

	// Same asynchronous concept as above for delete callback
	function deleteSongCallback(key) {
		socket.emit("deleteSong", key);
		let keyList = [];
		queue.forEach((queueItem) => {
			keyList.push(queueItem.key);
		});

		let targetIndex = keyList.indexOf(key);
		setQueue(queue.toSpliced(targetIndex, 1));
	}

	return (
		<div className="App">
			<PTZHeader />
			<URLInput />
			<Player />
			<Queue
				queue={queue}
				reorderQueueCallback={reorderQueueCallback}
				deleteSongCallback={deleteSongCallback}
			/>
		</div>
	);
}
