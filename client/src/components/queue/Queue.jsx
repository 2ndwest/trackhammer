import "./Queue.css";
import { useRef, useState } from "react";

import QueueItem from "./QueueItem.jsx";
import Player from "../player/Player.jsx";

export default function Queue({ queue, changeQueueCallback }) {
	const scrollSpeed = 50; // px per frame
	const edgeThreshold = 75; // px from top/bottom to trigger
	const listRef = useRef(null);
	const [activeDragIndex, setActiveDragIndex] = useState(null);

	// Define a drag function for smoother drag scrolling
	// If user is dragging within a certain margin of top or bottom, scroll smoothly
	function handleDragOver(e) {
		e.preventDefault();

		const container = listRef.current;
		if (!container) return;

		const { top, bottom } = container.getBoundingClientRect();
		const y = e.clientY;

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
		<div className="Queue-Wrapper" ref={listRef} onDragOver={handleDragOver}>
			<table className="Queue">
				<tbody>
					{/* Iterate through list and generate QueueItems with unique keys */}
					{queue.map((songInfo, idx) => (
						<QueueItem
							key={songInfo.id}
							songInfo={songInfo}
							thisIndex={idx}
							activeDragIndex={activeDragIndex}
							moveCallback={changeQueueCallback}
							activateDragCallback={setActiveDragIndex}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}
