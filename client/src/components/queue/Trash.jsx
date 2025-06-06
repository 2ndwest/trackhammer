import "./Queue.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function Trash({
	activeDragIndex,
	setActiveDragCallback,
	shrinkQueueCallback,
}) {
	let [hovered, setHovered] = useState(false);

	function stopActiveState(e) {
		setHovered(false);
	}

	function handleHover(e) {
		e.preventDefault();
		setHovered(true);
	}

	function deleteItem(e) {
		shrinkQueueCallback(activeDragIndex);
		setActiveDragCallback(-1);
		setHovered(false);
	}

	return (
		<div
			className={
				activeDragIndex === -1
					? "Trash-Container"
					: hovered
						? "Trash-Container Active"
						: "Trash-Container Visible"
			}
			onDragOver={handleHover}
			onDragLeave={stopActiveState}
			onDrop={deleteItem}
		>
			<FontAwesomeIcon icon={faTrash} />
		</div>
	);
}
