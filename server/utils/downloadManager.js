import ytdlp from "yt-dlp-exec";
import fs, { promises as fsp } from "fs";
import { notifyPlayer } from "../sockets/playback.js";

const TRACK_DIR = process.cwd() + "/tracks/";
const PROJ_DIR = process.cwd() + "/";

export default class DownloadManager {
	constructor() {
		// Cap and stall are for throttling download speed
		// yt-dl craps out if there are too many api calls
		// So when the queue is long we download slowly
		this.downloadCap = 2;
		this.downloadStall = 0;
		this.downloadQueue = [];
		this.currentlyDownloading = [];
		this.downloaderRunning = false;
	}

	// Takes in the queue from playback and adds songs that need downloading
	async updateQueue(queue) {
		this.downloadQueue = [];
		for (const songInfo of queue) {
			let tracks = fs.readdirSync(TRACK_DIR);
			let dlQueueTitles = this.downloadQueue.map((song) => song.title);

			if (tracks.includes(songInfo.title + ".mp3")) {
				notifyPlayer();
				continue;
			}
			if (dlQueueTitles.includes(songInfo.title)) continue;
			if (this.currentlyDownloading.includes(songInfo.title)) continue;
			this.downloadQueue.push(songInfo);
		}
		if (this.downloadQueue.length > 100) {
			this.downloadCap = 1;
			this.downloadStall = 5000;
			console.log("Queue is long - enabling throttling");
		}
		if (!this.downloaderRunning) this.runDownloader();
	}

	// Runs forever, constantly keeps downloads running up to a cap
	async runDownloader() {
		this.downloaderRunning = true;

		const inFlight = new Set();

		while (this.downloadQueue.length > 0) {
			//
			// Inner loop for keeping downloads topped off
			while (
				this.currentlyDownloading.length < this.downloadCap &&
				this.downloadQueue.length > 0
			) {
				let nextSongInfo = this.downloadQueue.shift();
				try {
					this.downloadTrack(nextSongInfo, inFlight);
				} catch (error) {
					console.error(error);
					await new Promise((r) => setTimeout(r, 20000));
				}
			}

			console.log("Currently Downloading: " + this.currentlyDownloading);
			// Wait for any download to finish (Promise.race) and then start a new one
			if (this.currentlyDownloading.length === this.downloadCap) {
				await Promise.race([...inFlight]);
			}

			await new Promise((r) => setTimeout(r, this.downloadStall));
		}
		this.downloaderRunning = false;
	}
	// Downloads a track to the tracks directory
	// Uses https://github.com/AYehia0/soundcloud-dl
	async downloadTrack(songInfo, inFlight) {
		const url = songInfo.permaURL;
		const trackName = songInfo.title;
		this.currentlyDownloading.push(songInfo.title);

		const downloadPromise = ytdlp(url, {
			extractAudio: true,
			cookies: PROJ_DIR + "sc_cookies.txt",
			"audio-format": "mp3",
			"audio-quality": "0",
			"retry-sleep": "5",
			"extractor-retries": "10",
			"f": "bestaudio[protocol!=m3u8]",
			"concurrent-fragments": "1",
			"sleep-requests": "1",
			"sleep-interval": "2",
			output: TRACK_DIR + trackName + "-temp.mp3",
		});

		inFlight.add(downloadPromise);

		try {
			await downloadPromise;
			// Clean up the track after downloading
			await this.cleanupTrack(trackName);
		} catch (error) {
			console.error("Error downloading track:", error);
		} finally {
			// Remove from the currently downloading list once done
			this.currentlyDownloading = this.currentlyDownloading.filter(
				(title) => title !== songInfo.title,
			);
			// Once done, remove from inFlight set
			inFlight.delete(downloadPromise);
			console.log("Download finished:", songInfo.title);
			notifyPlayer();

			// Disable throttle if queue is short enough
			if (this.downloadQueue.length < 50) {
				this.downloadCap = 3;
				this.downloadStall = 0;
			}
		}
	}

	// Makes the filename equivalent to the track name
	async cleanupTrack(trackName) {
		const finalPath = TRACK_DIR + trackName;
		let tracks = fs.readdirSync(TRACK_DIR);
		if (tracks.includes(trackName + "-temp.mp3")) {
			fsp.rename(finalPath + "-temp.mp3", finalPath + ".mp3");
		}
	}
}
