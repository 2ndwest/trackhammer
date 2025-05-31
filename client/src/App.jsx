import "./App.css";
import PTZHeader from "./components/PTZHeader.jsx";
import URLInput from "./components/URLInput.jsx";

function App() {
	return (
		<div className="App">
			{PTZHeader()}
			{URLInput()}
		</div>
	);
}

export default App;
