import "./Player.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
	faPlay,
	faPause,
	faForward,
	faBackward,
	faVolumeHigh,
	faVolumeLow,
	faVolumeXmark,
	faPlus,
	faMinus,
} from "@fortawesome/free-solid-svg-icons";

export default function Buttons() {
	var isPlaying = false;

	let [volume, setVolume] = useState(0);

	function raiseVolumeCallback() {
		if (volume < 10) setVolume(volume + 0.5);
	}
	function lowerVolumeCallback() {
		if (volume > 0) setVolume(volume - 0.5);
	}

	return (
		<div className="Button-Panel container">
			<div className="Volume-Container">
				<div className="Volume-Icon-Container">
					<FontAwesomeIcon
						icon={
							volume >= 5
								? faVolumeHigh
								: volume !== 0
									? faVolumeLow
									: faVolumeXmark
						}
					/>
				</div>
				<div className="Volume-Meter-Container">
					<meter className="Volume-Meter" max="10" value={volume}></meter>
					<div className="Volume-Buttons-Container">
						<button
							className="Volume-Button"
							type="button"
							onClick={lowerVolumeCallback}
						>
							<FontAwesomeIcon icon={faMinus} />
						</button>
						<button
							className="Volume-Button"
							type="button"
							onClick={raiseVolumeCallback}
						>
							<FontAwesomeIcon icon={faPlus} />
						</button>
					</div>
				</div>
			</div>
			<div className="Playback-Buttons-Container">
				<button className="Playback-Button Outer-Button" type="button">
					<FontAwesomeIcon icon={faBackward} />
				</button>
				<button className="Playback-Button" type="button">
					<FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
				</button>
				<button className="Playback-Button" type="button">
					<FontAwesomeIcon icon={faForward} />
				</button>
			</div>
		</div>
	);
}
