import ptz from "./resources/ptz.svg";
import "./App.css";
import Alert from "@mui/material/Alert";
import React from "react";

function App() {
	return (
		<div className="App">
			<PTZHeader />
			<URLInput />
		</div>
	);
}

// Define function for PTZ Logo
function PTZHeader() {
	return (
		<header className="App-header">
			<img src={ptz} className="App-logo" alt="PUTZ Logo" />
		</header>
	);
}

// Define text input for links
function URLInput() {
	function submitSong() {
		console.log("YEE HAW");
	}

	return (
		<div className="Song-Input">
			<input
				className="URL-Input"
				name="SoundCloud URL Input"
				placeholder="Enter SoundCloud URL..."
			/>
			<button className="Hammer-Button" onClick={submitSong}>
				HAMMER
			</button>
		</div>
	);
}

export default App;
