import { spawn } from "child_process";
import { timeCallback, playNextSong } from "../sockets/playback.js";

class AudioPlayer {
	constructor(timeCallback) {
		this.TRACK_DIR = process.cwd() + "/tracks/";

		this.player = spawn("mpg123", ["-R", "-o", "pulse"], {
			stdio: ["pipe", "pipe", "inherit"],
		});

		// Listen to updates on stdout
		this.player.stdout.setEncoding("utf8");
		this.player.stdout.on("data", this.handlePlayerData.bind(this));
		this.lastElapsed = 0;
		this.timeCallback = timeCallback;

		this.isPlaying = false;

		// Compute logarithmic volume array
		this.volumeLevels = [];
		const base = 1.258;
		for (let i = 0; i <= 20; i++) {
			this.volumeLevels.push(base ** i);
		}
	}

	// Handle data like playback progress and status
	handlePlayerData(data) {
		data = data.trim();

		// Handle frame updates (for song time)
		if (data.startsWith("@F")) {
			// @F frameCount framesLeft elapsedSeconds secondsLeft
			const parts = data.split(/\s+/);
			const elapsed = parseFloat(parts[3]);
			if (parseInt(parts[1]) < 10) this.lastElapsed = 0;
			if (elapsed - this.lastElapsed > 0.1) {
				this.lastElapsed = elapsed;
				timeCallback(elapsed);
			}
		}

		// Handle end of file event for next song
		if (data.startsWith("@P")) {
			const parts = data.split(/\s+/);
			if (parts[1] == 3) {
				playNextSong();
				console.log("Reached end of song");
			}
		}
	}

	play(trackName) {
		const trackUrl = this.TRACK_DIR + trackName + ".mp3";
		if (this.isPlaying) {
			this.stop(); // Stop current track if already playing
		}
		console.log(`Playing track: ${trackName}`);
		//soundcloud.com/kasbomusic/burial-archangel-kasbo-club-edit
		https: this.player.stdin.write(`LOAD ${trackUrl}\n`);
		this.isPlaying = true;
		this.lastElapsed = 0;
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
			console.log("Playback Stopped");
		}
	}

	setVolume(percent) {
		let volumeLevel = this.volumeLevels[parseInt(percent / 5)];
		this.player.stdin.write(`VOLUME ${volumeLevel}\n`);
	}

	mute() {
		this.player.stdin.write("MUTE\n");
	}
	unmute() {
		this.player.stdin.write("UNMUTE\n");
	}
}

export default new AudioPlayer();
