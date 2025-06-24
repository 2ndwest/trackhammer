import AudioPlayer from "../utils/audioPlayer.js";
import { getNextSong } from "./queue.js";

let activeSong = false;

let volume = 5;
let isMuted = false;
let isPlaying = false;
let progressSeconds = 120; // Integer in seconds
let queue = [];
let io = null;

// Allows the queue to tell player when a new song has been added
export function notifyPlayer() {
	console.log("Player notified: " + activeSong);
	if (!activeSong) playNextSong();
}

function playNextSong() {
	activeSong = getNextSong();
	console.log("playNextSong(): " + activeSong);
	if (!activeSong) {
		isPlaying: false;
		return;
	}
	progressSeconds = 0;
	isPlaying = true;
	io.emit("updateSong", activeSong);
	io.emit("updateProgress", progressSeconds);
	io.emit("updatePlaybackState", isPlaying);
	AudioPlayer.setVolume(volume);
	AudioPlayer.play(activeSong.track);
}

export function timeCallback(seconds) {
	io.emit("updateProgress", seconds)
}

// socket is the individual connection, io is all connected clients
export default function setupPlaybackLogic(socket, ioInput) {
	io = ioInput;

	socket.emit("updateSong", activeSong);
	socket.emit("updateVolume", volume);
	socket.emit("updateMutedState", isMuted);
	socket.emit("updateProgress", progressSeconds);
	socket.emit("updatePlaybackState", isPlaying);

	// Note that in the player class, volume is processed logarithmically.
	// You hear volume logarithmically as well.
	// 0 - 100 should just represent the desired percieved loudness level.
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
		AudioPlayer.pause();
		console.log("Changing playback state");
		io.emit("updatePlaybackState", isPlaying);
	});

	socket.on("resetSongProgress", () => {
		progressSeconds = 0;
		isPlaying = true;
		AudioPlayer.play(activeSong.track);
		console.log("Restarting song progress");
		io.emit("updateProgress", progressSeconds);
	});

	socket.on("skipSong", () => {
		activeSong = false;
		io.emit("updateSong", activeSong);
		AudioPlayer.stop();
		console.log("Skipping song");
		playNextSong();
	});
}
