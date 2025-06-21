import fetch from "node-fetch";
import "dotenv/config";
import { promises as fs } from "fs";

export async function initWithCode(code) {
	// Request authentication token from Soundcloud
	// See https://developers.soundcloud.com/docs/api/guide#authentication
	// Runs only once ever (if you're reading this it has already been run)

	const params = new URLSearchParams({
		client_id: process.env.SOUNDCLOUD_CLIENT_ID,
		client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
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
	fs.writeFile("../tokenData.json", tokenDataJSON, "utf8");

	return access_token;
}

// Get up to date tokens for streaming
export async function getAccessToken() {
	// Get tokens back out from file
	let tokenData;
	try {
		const raw = await fs.readFile("../tokenData.json", "utf8");
		tokenData = JSON.parse(raw);
	} catch (err) {
		throw new Error("No token data found - Authenticate first");
	}
	if (Date.now() > tokens.expires_at - 60_000) {
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
		await fs.writeFile(TOKEN_STORE, JSON.stringify(tokenData, null, 2), "utf8");
	}
	return tokens.access_token;
}
