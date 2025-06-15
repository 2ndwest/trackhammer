import "./Player.css";
import socket from "../../socket.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import {
	faPlay,
	faPause,
	faForward,
	faBackward,
	faVolumeHigh,
	faVolumeLow,
	faVolumeOff,
	faVolumeXmark,
	faPlus,
	faMinus,
} from "@fortawesome/free-solid-svg-icons";

export default function Buttons() {
	let [isPlaying, setIsPlaying] = useState(false);
	let [volume, setVolume] = useState(0);
	let [isMuted, setIsMuted] = useState(false);

	// Get volume from server
	useEffect(() => {
		socket.on("updateVolume", setVolume);
		socket.connect();
		return () => socket.off("updateVolume");
	}, []);
	// Get playback state from server
	useEffect(() => {
		socket.on("updatePlaybackState", setIsPlaying);
		socket.connect();
		return () => socket.off("updatePlaybackState");
	}, []);
	// Get muted state from server
	useEffect(() => {
		socket.on("updateMutedState", setIsMuted);
		socket.connect();
		return () => socket.off("updateMutedState");
	}, []);

	function raiseVolumeCallback() {
		socket.emit("raiseVolume");
	}
	function lowerVolumeCallback() {
		socket.emit("lowerVolume");
	}
	function changeMutedState() {
		socket.emit("changeMutedState");
	}
	function changePlaybackStateCallback() {
		socket.emit("changePlaybackState");
	}

	return (
		<div className="Button-Panel container">
			<div className="Volume-Container">
				<button className="Volume-Icon-Button" onClick={changeMutedState}>
					<FontAwesomeIcon
						icon={
							isMuted
								? faVolumeXmark
								: volume === 0
									? faVolumeOff
									: volume < 5
										? faVolumeLow
										: faVolumeHigh
						}
					/>
				</button>
				<div className="Volume-Meter-Container">
					<meter
						className={isMuted ? "Volume-Meter Muted" : "Volume-Meter"}
						max="10"
						value={volume}
					></meter>
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
				<button
					className="Playback-Button"
					type="button"
					onClick={changePlaybackStateCallback}
				>
					<FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
				</button>
				<button className="Playback-Button" type="button">
					<FontAwesomeIcon icon={faForward} />
				</button>
			</div>
		</div>
	);
}
