import "./Queue.css";
import { useRef, useState } from "react";
import { arrayMoveImmutable } from "array-move";

import QueueItem from "./QueueItem.jsx";

export default function Queue() {
	const [queue, setQueue] = useState([
		"Abracadabra",
		"Brand New Bitch",
		"Club Classics",
		"Depth Charge",
		"Everybody Wants to Rule the World",
		"FE!N",
		"Gagnam Style",
		"Harder Better Faster Stronger",
		"I FEEL LIKE DANCING",
		"Just What I Needed",
		"Karma",
		"LOSING IT",
	]);

	// Define a callback for QueueItems to call when they are moved
	function moveItem(startIndex, endIndex) {
		const newQueue = arrayMoveImmutable(queue, startIndex, endIndex);
		console.log(newQueue);
		setQueue(newQueue);
	}

	// auto-scroll state
	const scrollSpeed = 50; // px per frame (tweak as needed)
	const edgeThreshold = 60; // px from top/bottom to trigger
	const listRef = useRef(null);

	// Define a drag function for smoother drag scrolling
	// If user is dragging within a certain margin of top or bottom, scroll smoothly
	function handleDragOver(e) {
		console.log("uhh");

		e.preventDefault();

		const container = listRef.current;
		if (!container) return;

		const { top, bottom } = container.getBoundingClientRect();
		const y = e.clientY;

		// if pointer is within `edgeThreshold` px of the top edge:
		if (y < top + edgeThreshold) {
			container.scrollBy({ top: -scrollSpeed, behavior: "auto" });
		}
		// if pointer is within `edgeThreshold` px of the bottom edge:
		else if (y > bottom - edgeThreshold) {
			container.scrollBy({ top: scrollSpeed, behavior: "auto" });
		}
		// otherwise, don’t scroll
	}

	return (
		<ol className="Queue" ref={listRef} onDragOver={handleDragOver}>
			{/* Iterate through list and generate QueueItems with unique keys */}
			{queue.map((url, idx, array) => (
				<QueueItem
					key={url}
					url={url}
					thisIndex={idx}
					moveCallback={moveItem}
				/>
			))}
		</ol>
	);
}
