import fetch from "node-fetch";
import "dotenv/config";
import fs, { promises as fsp } from "fs";
import { exec } from "child_process";
import path from "path";
import ytdlp from "yt-dlp-exec";
import { notifyPlayer } from "../sockets/playback.js"

const TOKEN_ENDPOINT = "https://api.soundcloud.com/oauth2/token";
const CALLBACK_URI = "https://trackhammer.mit.edu/callback";
const TOKEN_DIR = "../tokenData.json";
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;
const CLIENT_SECRET = process.env.SOUNDCLOUD_CLIENT_SECRET;
const PROJ_DIR = process.cwd() + "/";
const TRACK_DIR = process.cwd() + "/tracks/";
let keyTracker = 0;

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

export async function getJSON(url, token) {
	// Get track information from soundcloud URL
	const res = await fetch(
		`https://api.soundcloud.com/resolve?url=${encodeURIComponent(url)}`,
		{
			headers: { Authorization: `Bearer ${token}` },
		},
	);

	const status = 0;
;
	if (!res.ok) {
		let status = 1;
		const body = await res.text();
		if (res.status == 404) {
			status = 404;
		}
		return { status };
	}
	return { status: status, resJSON: await res.json() };
}

export function addToQueue(resJSON, queue, token) {
	if (resJSON.kind === "track") {
		const newSong = createNewSongInfo(resJSON, keyTracker);
		queue.push(newSong);
		return queue;
	} else if (resJSON.kind === "playlist") {
		resJSON.tracks.forEach((song, idx) => {
			const newSong = createNewSongInfo(song, keyTracker);
			queue.push(newSong);
			keyTracker += 1;
		})
		return queue;
	}
}

function createNewSongInfo(songJSON, key) {
	let artist = undefined;
	if (songJSON.metadata_artist) artist = songJSON.metadata_artist;
	else artist = songJSON.user.username
	return {
		permaURL: songJSON.permalink_url,
		title: songJSON.title,
		artist: artist,
		duration: parseInt(songJSON.duration / 1000),
		coverURL: songJSON.artwork_url,
		key: key,
	};
}

// Downloads a track to the tracks directory
// Uses https://github.com/AYehia0/soundcloud-dl
// This is so ugly lmao
export async function downloadTrack(songJSON) {
	const url = songJSON.permaURL;
	const trackName = songJSON.title;

	await ytdlp(url, {
		extractAudio: true,
		cookies: PROJ_DIR + "sc_cookies.txt",
		"audio-format": "mp3",
		"audio-quality": "0",
		output: TRACK_DIR + trackName + "-temp.mp3",
	});

	await cleanupTrack(trackName);
}

// Makes the filename equivalent to the track name
async function cleanupTrack(trackName) {
	const finalPath = TRACK_DIR + trackName;
	let tracks = fs.readdirSync(TRACK_DIR);
	if (tracks.includes(trackName + "-temp.mp3")) {
		fsp.rename(finalPath + "-temp.mp3", finalPath + ".mp3");
	}
}
