import "./Player.css";
import Buttons from "./Buttons.jsx";
import { getTimeString } from "../../utils/TimeHelpers.js";
import { useState, useEffect } from "react";
import socket from "../../socket.js";

export default function Player() {
	let [songInfo, setSongInfo] = useState(0);
	let [progress, setProgress] = useState(0);

	// Get current song progress from server
	useEffect(() => {
		socket.on("updateProgress", setProgress);
		socket.connect();
		return () => socket.off("updateProgress");
	}, []);

	// Get currently playing song from server
	useEffect(() => {
		socket.on("updateSong", setSongInfo);
		socket.connect();
		return () => socket.off("updateSong");
	}, []);

	function resetSongCallback() {
		setProgress(0);
		socket.emit("resetSongProgress");
	}

	function skipSongCallback() {
		setProgress(songInfo.duration);
		socket.emit("skipSong");
	}

	const completionPercentage = songInfo.duration
		? (progress / songInfo.duration) * 100
		: 0;

	return (
		<div className={songInfo === 0 ? "Player-Empty" : "Player"}>
			<div className="Album-Container">
				<img src={songInfo.coverPath} alt={songInfo.track} />
			</div>
			<div className="Player-Body">
				<div className="Track-Container Fade-Out">
					<a href={songInfo.link} target="_blank" rel="noreferrer">
						{songInfo.track}
					</a>
				</div>
				<div className="Artist-Container Fade-Out">
					<p>{songInfo.artist}</p>
				</div>
				<div className="Progress-Container">
					<div className="Bar-Container">
						<progress
							className="Bar-Progress"
							id="track-progress"
							value={completionPercentage}
							max="100"
						/>
					</div>
					<div className="Time-Container">
						<p>
							{getTimeString(progress)}/{getTimeString(songInfo.duration)}
						</p>
					</div>
				</div>
			</div>
			<Buttons
				resetSongCallback={resetSongCallback}
				skipSongCallback={skipSongCallback}
			/>
		</div>
	);
}
