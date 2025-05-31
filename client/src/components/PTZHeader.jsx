import ptz from "../resources/ptz.svg";

// Define function for PTZ Logo
export default function PTZHeader() {
	return (
		<header className="App-header">
			<img src={ptz} className="App-logo" alt="PUTZ Logo" />
		</header>
	);
}
