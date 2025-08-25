import { ReactComponent as Logo } from "../../resources/ptz.svg";
import "./PTZHeader.css";

// Define function for PTZ Logo
export default function PTZHeader() {
	return (
		<header className="App-header">
			<a
				href="https://soundcloud.com/putz-800223900/sets"
				target="_blank"
				rel="noreferrer"
				draggable="false"
			>
				<Logo className="App-logo" alt="PUTZ Logo" draggable="false" />
			</a>
		</header>
	);
}
