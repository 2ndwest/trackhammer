import AudioPlayer from "../utils/audioPlayer.js";
import { getNextSong } from "./queue.js";

let activeSong = false;

let volume = 50;
let isMuted = false;
let isPlaying = false;
let queue = [];
let io = null;

// Allows the queue to tell player when a new song has been added
export function notifyPlayer() {
	if (!activeSong) playNextSong();
}

export function playNextSong() {
	activeSong = getNextSong();
	if (!activeSong) {
		isPlaying: false;
	} else {
		isPlaying = true;
		AudioPlayer.play(activeSong.title);
	}
	io.emit("updateSong", activeSong);
	io.emit("updatePlaybackState", isPlaying);
	AudioPlayer.setVolume(volume);
}

export function timeCallback(seconds) {
	io.emit("updateProgress", seconds);
}

// socket is the individual connection, io is all connected clients
export default function setupPlaybackLogic(socket, ioInput) {
	io = ioInput;

	socket.emit("updateSong", activeSong);
	socket.emit("updateVolume", volume);
	socket.emit("updateMutedState", isMuted);
	socket.emit("updateProgress", 0);
	socket.emit("updatePlaybackState", isPlaying);

	socket.on("lowerVolume", async () => {
		if (volume > 0) volume -= 5;
		await AudioPlayer.setVolume(volume);
		io.emit("updateVolume", volume);
	});

	socket.on("raiseVolume", async () => {
		if (volume < 100) volume += 5;
		await AudioPlayer.setVolume(volume);
		io.emit("updateVolume", volume);
	});

	socket.on("changeMutedState", async () => {
		isMuted = !isMuted;
		if (!isMuted) AudioPlayer.unmute();
		else AudioPlayer.mute();
		io.emit("updateMutedState", isMuted);
	});

	socket.on("changePlaybackState", () => {
		isPlaying = !isPlaying;
		AudioPlayer.changePlaybackState(isPlaying);
		if (isPlaying) console.log("Playing " + activeSong.title)
		else console.log("Pausing " + activeSong.title)
		io.emit("updatePlaybackState", isPlaying);
	});

	socket.on("resetSongProgress", () => {
		isPlaying = true;
		AudioPlayer.play(activeSong.title);
		console.log("Restarting " + activeSong.title);
	});

	socket.on("skipSong", () => {
		activeSong = false;
		AudioPlayer.changePlaybackState(false)
		console.log("Received Skipsong")
		io.emit("updateSong", activeSong);
		AudioPlayer.setIgnoreNextEnd(true)
		playNextSong();
	});
}