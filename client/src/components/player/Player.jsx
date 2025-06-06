import "./Player.css";
import Buttons from "./Buttons.jsx";
import { useState } from "react";

export default function Player({ songInfo }) {
	// eslint-disable-next-line
	let [progress, setProgress] = useState("1:30");

	// Takes in time string and returns seconds
	function getSeconds(time) {
		// Split string into seconds, minutes, hours array
		var a = time.toString().split(":").reverse();
		var seconds = 0;

		// Read each element in the array and multiply it by 60^(index)
		// Returns the duration in seconds
		for (let i = 0; i < a.length; i++) seconds += a[i] * 60 ** i;
		return seconds;
	}

	var progressSeconds = getSeconds(progress);
	var durationSeconds = getSeconds(songInfo.duration);

	var completionPercentage = (progressSeconds / durationSeconds) * 100;

	return (
		<div className="Player">
			<div className="Album-Container">
				<img src={songInfo.cover} alt={songInfo.track} />
			</div>
			<div className="Player-Body">
				<div className="Track-Container Fade-Out">
					<p>{songInfo.track}</p>
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
							{progress}/{songInfo.duration}
						</p>
					</div>
				</div>
			</div>
			<Buttons />
		</div>
	);
}
