import "./Queue.css";
import { useState } from "react";

export default function QueueItem({ url, thisIndex, moveCallback }) {
	// const track = "Trackname";
	// const artist = "Artist";
	// const duration = "5:00";

	// Handle appearance when dragging vs not
	const [isDragging, setIsDragging] = useState(false);

	// Handle appearance when hovered over
	const [isHovered, setIsHovered] = useState(false);

	// Define event handlers
	function startDragging(e) {
		setIsDragging(true);
		e.dataTransfer.setData("text/plain", thisIndex);
		e.dataTransfer.effectAllowed = "move";
	}

	function stopDragging(e) {
		setIsDragging(false);
	}

	function handleDraggedOver(e) {
		e.preventDefault();
		setIsHovered(true);
	}

	function handleDragLeave(e) {
		setIsHovered(false);
	}

	function handleDrop(e) {
		e.preventDefault();
		var startIndex = parseInt(e.dataTransfer.getData("text/plain"));
		moveCallback(startIndex, thisIndex);
		setIsHovered(false);
	}

	return (
		<div
			// Change the class name depending on drag state
			className={
				isDragging
					? "Queue-Item Dragged"
					: isHovered
						? "Queue-Item Hovered"
						: "Queue-Item"
			}
			draggable="true"
			// Events when this item is being dragged
			onDragStart={startDragging}
			onDragEnd={stopDragging}
			// Events when an item is dragged over this one
			onDragOver={handleDraggedOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<p>{url}</p>
		</div>
	);
}
