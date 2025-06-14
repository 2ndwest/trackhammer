import "./App.css";
import PTZHeader from "./components/header/PTZHeader.jsx";
import URLInput from "./components/urlinput/URLInput.jsx";
import Queue from "./components/queue/Queue.jsx";
import Player from "./components/player/Player.jsx";

export default function App() {
	return (
		<div className="App">
			<PTZHeader />
			<URLInput />
			<Player />
			<Queue />
		</div>
	);
}
