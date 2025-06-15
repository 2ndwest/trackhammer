import "./Queue.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import soundcloud from "../../resources/sc-logo.png";

export default function Trash({
	activeDragKey,
	setActiveDragCallback,
	deleteSongCallback,
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
		deleteSongCallback(activeDragKey);
		setActiveDragCallback(-1);
		setHovered(false);
	}

	return (
		<div className="Postqueue-Container">
			<div
				className={
					activeDragKey === -1
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
			<a
				className="SC-Logo-Link"
				href="https://soundcloud.com"
				target="_blank"
				rel="noreferrer"
				draggable="false"
			>
				<img
					className="SC-Logo"
					src={soundcloud}
					alt="Powered by Soundcloud"
					draggable="false"
				/>
			</a>
		</div>
	);
}
