import "./Queue.css";
import { useRef, useState } from "react";
import QueueItem from "./QueueItem.jsx";
import Trash from "./PostQueue.jsx";

export default function Queue({
	queue,
	reorderQueueCallback,
	deleteSongCallback,
}) {
	const scrollSpeed = 50; // px per frame
	const edgeThreshold = 50; // px from top/bottom to trigger
	const listRef = useRef(null);
	const [activeDragKey, setActiveDragKey] = useState(-1);

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
		<div className={queue.length === 0 ? "Hider-Active" : "Hider"}>
			<div className="Queue-Wrapper" ref={listRef} onDragOver={handleDragOver}>
				<table className="Queue">
					<tbody>
						{/* Iterate through list and generate QueueItems with unique keys */}
						{queue.map((songInfo, idx) => (
							<QueueItem
								key={songInfo.key}
								thisKey={songInfo.key} // Can't access key proper inside child
								songInfo={songInfo}
								thisIndex={idx}
								activeDragKey={activeDragKey}
								setActiveDragCallback={setActiveDragKey}
								reorderQueueCallback={reorderQueueCallback}
							/>
						))}
					</tbody>
				</table>
			</div>
			<Trash
				activeDragKey={activeDragKey}
				setActiveDragCallback={setActiveDragKey}
				deleteSongCallback={deleteSongCallback}
			/>
		</div>
	);
}
