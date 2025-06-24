import { spawn } from "child_process";
import { timeCallback } from "../sockets/playback.js";

class AudioPlayer {
	constructor(timeCallback) {
		this.TRACK_DIR = process.cwd() + "/tracks/";

		this.player = spawn("mpg123", ["-R", "-o", "alsa", "-a", "default"], {
			stdio: ["pipe", "pipe", "inherit"],
		});

		// Listen to updates on stdout
		this.player.stdout.setEncoding("utf8");
		this.player.stdout.on("data", this.handlePlayerData.bind(this));
		this.lastElapsed = 0;
		this.timeCallback = timeCallback;

		this.isPlaying = false;
	}

	// Handle data like playback progress and status
	handlePlayerData(data) {
		data = data.trim();
		if (!data.startsWith("@F")) return;

		// @F frameCount framesLeft elapsedSeconds secondsLeft
		const parts = data.split(/\s+/);
		const elapsed = parseFloat(parts[3]);
		if (elapsed - this.lastElapsed > 0.1) {
			this.lastElapsed = elapsed;
			timeCallback(elapsed);
		}

		console.log(`Elapsed seconds: ${elapsed.toFixed(1)}s`);
	}

	play(trackName) {
		const trackUrl = this.TRACK_DIR + trackName + ".mp3";
		if (this.isPlaying) {
			this.stop(); // Stop current track if already playing
		}
		console.log(`Playing track: ${trackName}`);
		this.player.stdin.write(`LOAD ${trackUrl}\n`);
		this.isPlaying = true;
	}

	pause() {
		this.player.stdin.write("PAUSE\n");
		this.isPlaying = !this.isPlaying;
		console.log("Paused/Unpaused");
	}

	// Necessary for skipping songs
	stop() {
		if (this.isPlaying) {
			this.player.stdin.write("STOP\n");
			this.isPlaying = false;
			console.log("Stopped");
		}
	}

	setVolume(percent) {
		this.player.stdin.write(`VOLUME ${percent}\n`);
	}

	mute() {
		this.player.stdin.write("MUTE\n");
	}
	unmute() {
		this.player.stdin.write("UNMUTE\n");
	}
}

export default new AudioPlayer();
