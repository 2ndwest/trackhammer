import "./Queue.css";
import { useState } from "react";

export default function QueueItem({
	songInfo,
	thisKey,
	thisIndex,
	activeDragKey,
	moveCallback,
	setActiveDragCallback,
}) {
	// Handle appearance when dragging vs not
	const [isDragging, setIsDragging] = useState(false);

	// Handle appearance when hovered over
	const [isHovered, setIsHovered] = useState(false);

	// Define event handlers
	function startDragging(e) {
		setIsDragging(true);
		setActiveDragCallback(thisKey);
		e.dataTransfer.setData("text/plain", thisKey);
		e.dataTransfer.effectAllowed = "move";
		// Add dragging property to body so cursor persists
		document.body.classList.add("dragging");
	}

	function stopDragging(e) {
		setIsDragging(false);
		// Remove dragging property from body
		document.body.classList.remove("dragging");
		setActiveDragCallback(-1);
	}

	function handleDraggedOver(e) {
		e.preventDefault();
		// Can't get data from dragged object on webshit
		if (activeDragKey === thisKey) return;
		setIsHovered(true);
	}

	function handleDragLeave(e) {
		setIsHovered(false);
	}

	function handleDrop(e) {
		e.preventDefault();
		console.log("activeDragKey: " + activeDragKey);
		console.log("thisKey: " + thisKey);
		moveCallback(activeDragKey, thisKey);
		setIsHovered(false);
	}

	return (
		<tr
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
			<td className="Column Album">
				<img src={songInfo.cover} alt={songInfo.track} className="Thumbnail" />
			</td>
			<td className="Column Handle">
				<p>{"  ⋮⋮"}</p>
			</td>
			<td className="Column Index">
				<p>{thisIndex + 1}.</p>
			</td>
			<td className="Column Track">
				<p className={isHovered ? "Info-Text Darkened" : "Info-Text"}>
					{songInfo.track}
				</p>
			</td>
			<td className="Column Artist">
				<p className={isHovered ? "Info-Text Darkened" : "Info-Text"}>
					{songInfo.artist}
				</p>
			</td>
			<td className="Column Duration">
				<p>{songInfo.duration}</p>
			</td>
		</tr>
	);
}
