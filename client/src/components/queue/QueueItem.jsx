import "./Queue.css";
import { useState } from "react";

export default function QueueItem({ songInfo, thisIndex, moveCallback }) {
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
			<div className="Column Album">
				<img
					src={songInfo.cover}
					alt={songInfo.track}
					className="Thumbnail"
				/>
			</div>
			<div className="Column Handle">
				<p>⣿</p>
			</div>
			<div className="Column Index">
				<p>{thisIndex + 1}.</p>
			</div>
			<div className="Column Track">
				<p className={isHovered ? "Text Darkened" : "Text" }>{songInfo.track}</p>
			</div>
			<div className="Column Artist">
				<p className={isHovered ? "Text Darkened" : "Text" }>{songInfo.artist}</p>
			</div>
			<div className="Column Duration">
				<p>{songInfo.duration}</p> 
			</div>
		</div>
	);
}
