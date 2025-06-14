import { useState, useRef } from "react";
import "./URLInput.css";
import socket from "../../socket.js";

// Define text input for links
export default function URLInput() {
	const [url, setUrl] = useState("");
	const buttonRef = useRef("null");
	const [errorText, setErrorText] = useState("");
	const [showError, setShowError] = useState(false);

	// Define function for action upon press
	async function submitSong() {
		if (!url.trim()) return;
		socket.emit("addSong", url, (response) => {
			if (response.success) {
				setUrl("");
				setShowError(false);
			} else {
				setErrorText(response.error);
				setShowError(true);
			}
		});
	}

	// Update the value of the url every time it's changed
	function updateText(e) {
		setUrl(e.target.value);
	}

	function handleKeyDown(e) {
		if (e.key === "Enter") {
			submitSong();
		}
	}

	return (
		<div className="Song-Entry">
			<div className="Text-Input">
				<input
					className="URL-Input"
					name="SoundCloud URL Input"
					placeholder="Enter SoundCloud URL..."
					value={url}
					onChange={updateText}
					onKeyDown={handleKeyDown}
					autoFocus
				/>
				<button
					className="Hammer-Button"
					type="button"
					onClick={submitSong}
					ref={buttonRef}
				>
					HAMMER
				</button>
			</div>
			{/* Conditionally render error messages to the user */}
			<div className={`Error${showError ? " visible" : ""}`}>{errorText}</div>
		</div>
	);
}
