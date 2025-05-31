import { useState, useRef } from "react";

// Define text input for links
export default function UrlInput() {
	const [url, setUrl] = useState("");
	const buttonRef = useRef("null");

	// Define function for action upon press
	async function submitSong() {
		if (!url.trim()) return;
		console.log(url);
		setUrl("");
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
		<div className="Song-Input">
			<input
				className="URL-Input"
				name="SoundCloud URL Input"
				placeholder="Enter SoundCloud URL..."
				value={url}
				onChange={updateText}
				onKeyDown={handleKeyDown}
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
	);
}
