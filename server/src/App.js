import ptz from "./ptz.svg";
import "./App.css";

function App() {
	return (
		<div className="App">
			{ptzHeader()}
			{urlInput()}
		</div>
	);
}

// Define function for PTZ Logo
function ptzHeader() {
	return (
		<header className="App-header">
			<img src={ptz} className="App-logo" alt="PUTZ Logo" />
		</header>
	);
}

// Define text input for links
function urlInput() {
	return (
		<div className="Song-Input">
			<input
				className="URL-Input"
				name="SoundCloud URL Input"
				placeholder="Enter SoundCloud URL..."
			/>
			<button className="Hammer-Button">HAMMER</button>
		</div>
	);
}

export default App;
