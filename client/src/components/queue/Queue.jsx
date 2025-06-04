import "./Queue.css";
import { useRef, useState } from "react";
import { arrayMoveImmutable } from "array-move";
import ctrl_alt_reality from "../../resources/ctrl-alt-reality.jpg";

import QueueItem from "./QueueItem.jsx";
import Player from "../player/Player.jsx";

export default function Queue() {
	class songInfo {
		constructor(link, track, artist, duration, cover, id) {
			this.link = link;
			this.track = track;
			this.artist = artist;
			this.duration = duration;
			this.cover = cover;
			this.id = id;
		}
	}

	const [progress, setProgress] = useState("1:30");

	const [queue, setQueue] = useState([
		new songInfo(
			"Link1",
			"Abracadabra",
			"Godspeed You! Black Emperor",
			"4:00:00",
			ctrl_alt_reality,
			0,
		),
		new songInfo(
			"Link2",
			"Brand New Bitch",
			"Cobrah",
			"3:00:00",
			ctrl_alt_reality,
			1,
		),
		new songInfo(
			"Link3",
			"Club Classics",
			"Charli XCX",
			"4:00",
			ctrl_alt_reality,
			3,
		),
		new songInfo(
			"Link4",
			"Depth Charge",
			"The Glitch Mob",
			"6:00:00",
			ctrl_alt_reality,
			4,
		),
		new songInfo(
			"Link5",
			"Extraterrestrials in Outer Space Super Long Line Lorem Impsum Dolor Sit Amet",
			"Katy Perry but its brat so its not Lorem",
			"4:00",
			ctrl_alt_reality,
			5,
		),
		new songInfo("Link6", "FE!N", "Travis Scott", "2:00", ctrl_alt_reality, 6),
		new songInfo("Link7", "Gangnam Style", "Psy", "3:00", ctrl_alt_reality, 7),
		new songInfo(
			"Link8",
			"Heads Will Roll",
			"A-Trak",
			"5:00",
			ctrl_alt_reality,
			8,
		),
		new songInfo(
			"Link9",
			"I FEEL LIKE DANCING",
			"Hardwell",
			"3:00",
			ctrl_alt_reality,
			9,
		),
		new songInfo(
			"Link10",
			"Just What I Needed",
			"The Cars",
			"4:00:00",
			ctrl_alt_reality,
			10,
		),
		new songInfo(
			"Link11",
			"Karma",
			"Taylor Swift",
			"4:00",
			ctrl_alt_reality,
			11,
		),
		new songInfo("Link12", "LOSING IT", "FISHER", "2:00", ctrl_alt_reality, 12),
	]);

	// Define a callback for QueueItems to call when they are moved
	function moveItem(startIndex, endIndex) {
		const newQueue = arrayMoveImmutable(queue, startIndex, endIndex);
		console.log(newQueue);
		setQueue(newQueue);
	}

	const scrollSpeed = 50; // px per frame
	const edgeThreshold = 75; // px from top/bottom to trigger
	const listRef = useRef(null);

	// Define a drag function for smoother drag scrolling
	// If user is dragging within a certain margin of top or bottom, scroll smoothly
	function handleDragOver(e) {
		e.preventDefault();

		const container = listRef.current;
		if (!container) return;

		const { top, bottom } = container.getBoundingClientRect();
		const y = e.clientY;

		if (y < top + edgeThreshold) {
			container.scrollBy({ top: -scrollSpeed, behavior: "auto" });
		}
		// if pointer is within `edgeThreshold` px of the bottom edge:
		else if (y > bottom - edgeThreshold) {
			container.scrollBy({ top: scrollSpeed, behavior: "auto" });
		}
		// otherwise, don’t scroll
	}

	return (
		<div>
			<Player songInfo={queue[0]} progress={progress} />
			<div className="Queue-Wrapper" ref={listRef} onDragOver={handleDragOver}>
				<table className="Queue">
					<tbody>
						{/* Iterate through list and generate QueueItems with unique keys */}
						{queue.map((songInfo, idx) => (
							<QueueItem
								key={songInfo.id}
								songInfo={songInfo}
								thisIndex={idx}
								moveCallback={moveItem}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
