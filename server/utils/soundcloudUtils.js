import fetch from "node-fetch";
import "dotenv/config";
import fs, { promises as fsp } from "fs";
import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";

const TOKEN_ENDPOINT = "https://api.soundcloud.com/oauth2/token";
const CALLBACK_URI = "https://trackhammer.mit.edu/callback";
const TOKEN_DIR = "../tokenData.json";
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET;
const PROJ_DIR = process.cwd() + "/";
const TRACK_DIR = process.cwd() + "/tracks/";

//////////////////////////////////////////////////
// FUNCTIONS FOR AUTHENTICATING WITH SOUNDCLOUD //
//////////////////////////////////////////////////

export async function initWithCode(code) {
	// Request authentication token from Soundcloud
	// See https://developers.soundcloud.com/docs/api/guide#authentication
	// Runs only once ever (if you're reading this it has already been run)

	const params = new URLSearchParams({
		client_id: CLIENT_ID,
		client_secret: CLIENT_SECRET,
		grant_type: "authorization_code",
		redirect_uri: "https://trackhammer.mit.edu/callback",
		code: code,
	});

	const res = await fetch("https://api.soundcloud.com/oauth2/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	console.log(res);
	if (!res.ok) throw new Error("Token exchange failed");
	const { access_token, refresh_token, expires_in } = await res.json();

	let tokenData = {
		access_token,
		refresh_token,
		expires_at: Date.now() + expires_in * 1000,
	};
	let tokenDataJSON = JSON.stringify(tokenData, null, 2);
	fsp.writeFile(TOKEN_DIR, tokenDataJSON, "utf8");

	return access_token;
}

// Get up to date tokens for streaming
export async function getAccessToken() {
	// Get tokens back out from file
	let tokenData;
	try {
		const raw = await fsp.readFile("../tokenData.json", "utf8");
		tokenData = JSON.parse(raw);
	} catch (err) {
		throw new Error("No token data found - Authenticate first");
	}
	if (Date.now() > tokenData.expires_at - 60_000) {
		// refresh if expired / near-expiry
		const params = new URLSearchParams({
			client_id: process.env.SOUNDCLOUD_CLIENT_ID,
			client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
			grant_type: "refresh_token",
			refresh_token: tokenData.refresh_token,
		});

		const res = await fetch(TOKEN_ENDPOINT, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params.toString(),
		});

		if (!res.ok) {
			const errBody = await res.text();
			throw new Error(`Token refresh failed: ${res.status} ${errBody}`);
		}

		const json = await res.json();
		tokenData = {
			access_token: json.access_token,
			refresh_token: json.refresh_token || tokenData.refresh_token,
			expires_at: Date.now() + json.expires_in * 1000,
		};
		await fsp.writeFile(TOKEN_DIR, JSON.stringify(tokenData, null, 2), "utf8");
	}
	return tokenData.access_token;
}

//////////////////////////////////////////////////
// FUNCTIONS FOR ADDING A NEW SONG TO THE QUEUE //
//////////////////////////////////////////////////

export async function addToQueue(songJSON, queue, token, key) {
	// Gets list of already downloaded tracks
	let tracks = fs.readdirSync(TRACK_DIR);
	if (!tracks.includes(songJSON.title + ".mp3")) {
		// Not awaited so that we can add to the client queue before download is finished
		downloadTrack(songJSON, tracks);
	}

	const newSong = createNewSongInfo(songJSON, key);
	queue.push(newSong);
	return queue;
}

function createNewSongInfo(songJSON, key) {
	return {
		permaURL: songJSON.permalink_url,
		track: songJSON.title,
		artist: songJSON.metadata_artist,
		duration: parseInt(songJSON.duration / 1000),
		coverURL: songJSON.artwork_url,
		key: key,
	};
}

// Downloads a track to the tracks directory
// Uses https://github.com/AYehia0/soundcloud-dl
// This is so ugly lmao
async function downloadTrack(songJSON) {
	const url = songJSON.permalink_url;
	const trackName = songJSON.title;

	return new Promise(function (resolve, reject) {
		// Download the file to tracks dir
		exec(
			PROJ_DIR + "bin/soundcloud-dl -b -p " + PROJ_DIR + "tracks/ " + url,
			(err, stdout, stderr) => {
				if (err) {
					reject(err);
				} else {
					cleanupTrack(trackName);
					resolve({ stdout, stderr });
				}
			},
		);
	});
}

// Makes the filename equivalent to the track name
async function cleanupTrack(trackName) {
	let tracks = fs.readdirSync(TRACK_DIR);
	for (const track of tracks) {
		if (track.lastIndexOf(trackName, 0) === 0) {
			convertAndRename(TRACK_DIR + track, TRACK_DIR + trackName + ".mp3");
		}
	}
}

async function convertAndRename(inputPath, outputPath) {
	// Get extension of original file
	// If it doesn't need conversion we'll skip it
	const ext = path.extname(inputPath).toLowerCase();

	if (inputPath === outputPath) {
		return;
	} else if (ext === ".mp3") {
		fsp.rename(inputPath, outputPath);
		return;
	}

	return new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.format("mp3")
			.audioCodec("libmp3lame")
			.on("error", reject)
			.on("end", () => {
				fs.unlink(inputPath, () => {
					resolve();
				});
			}) // Delete file after finishing conversion
			.save(outputPath);
	});
}
