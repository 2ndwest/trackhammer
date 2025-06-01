import "./App.css";
import PTZHeader from "./components/header/PTZHeader.jsx";
import URLInput from "./components/urlinput/URLInput.jsx";
import Queue from "./components/queue/Queue.jsx";

function App() {
	return (
		<div className="App">
			{PTZHeader()}
			{URLInput()}
			{Queue()}
		</div>
	);
}

export default App;
