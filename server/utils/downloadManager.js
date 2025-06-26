import ytdlp from "yt-dlp-exec";
import fs, { promises as fsp } from "fs";

const TRACK_DIR = process.cwd() + "/tracks/";
const PROJ_DIR = process.cwd() + "/";

export default class DownloadManager {
	constructor() {
		this.downloadCap = 4;
		this.downloadQueue = [];
		this.currentlyDownloading = [];
		this.downloaderRunning = false;
	}

	// Takes in the queue from playback and adds songs that need downloading
	async updateQueue(queue) {
		console.log("Updating Queue");
		for (const songInfo of queue) {
			let tracks = fs.readdirSync(TRACK_DIR);
			let dlQueueTitles = this.downloadQueue.map((song) => song.title);

			if (tracks.includes(songInfo.title + ".mp3")) return;
			if (dlQueueTitles.includes(songInfo.title)) return;
			if (this.currentlyDownloading.includes(songInfo.title)) return;
			this.downloadQueue.push(songInfo);
		}
		console.log("downloader running" + this.downloaderRunning);
		if (!this.downloaderRunning) this.runDownloader();
	}

	// Runs forever, constantly keeps downloads running up to a cap
	async runDownloader() {
		console.log(this.downloadQueue);
		this.downloaderRunning = true;
		console.log("running downloader");
		while (
			this.currentlyDownloading < this.downloadCap &&
			this.downloadQueue.length != 0
		) {
			console.log("looping");
			let nextSongInfo = this.downloadQueue.shift(0);
			this.downloadTrack(nextSongInfo);

			// Waits until downloadTrack calls wake for next track
			await new Promise((r) => (this._wake = r));
			this._wake = null;
			console.log("finished download");
		}
		console.log("line50");
		this.downloaderRunning = false;
	}
	// Downloads a track to the tracks directory
	// Uses https://github.com/AYehia0/soundcloud-dl
	async downloadTrack(songInfo) {
		const url = songInfo.permaURL;
		const trackName = songInfo.title;
		this.currentlyDownloading.push(songInfo.title);

		await ytdlp(url, {
			extractAudio: true,
			cookies: PROJ_DIR + "sc_cookies.txt",
			"audio-format": "mp3",
			"audio-quality": "0",
			output: TRACK_DIR + trackName + "-temp.mp3",
		});

		await this.cleanupTrack(trackName);
		this.currentlyDownloading = this.currentlyDownloading.filter(
			(e) => e !== songInfo.track,
		);
		if (this._wake) this._wake();
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
