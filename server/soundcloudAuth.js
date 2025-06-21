import fetch from "node-fetch";
import "dotenv/config";
import * as fs from "fs";

export async function initWithCode(code) {
	// Request authentication token from Soundcloud
	// See https://developers.soundcloud.com/docs/api/guide#authentication
	// Runs only once ever (if you're reading this it has already been run)
	const params = new URLSearchParams({
		client_id: process.env.SOUNDCLOUD_CLIENT_ID,
		client_secret: process.env.SOUNDCLOUD_CLIENT_SECRET,
		grant_type: "authorization_code",
		redirect_url: "http://trackhammer.mit.edu/callback",
		code: code,
	});

	const res = fetch("https://secure.soundcloud.com/oauth/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	if (!response.ok) throw new Error("Token exchange failed");
	const { access_token, refresh_token, expires_in } = await response.json();

	let tokenData = {
		access_token,
		refresh_token,
		expires_at: Date.now() + expires_in * 1000,
	};
	let tokenDataJSON = tokenData.stringify();
	fs.writeFile("../tokenData.json", tokenDataJSON);

	return access_token;
}

// Get up to date tokens for streaming
// Runs when the server restarts
export async function getAccessToken() {
	// Get tokens back out from file
	const tokens = await fs.readFile("../tokenData.json", (error, data) => {
		if (error) {
			console.log(error);
			throw err;
		}
	});
	if (Date.now() > tokens.expires_at - 60_000) {
		// refresh if expired / near-expiry
		const params = new URLSearchParams({
			/* grant_type=refresh_token + tokens.refresh_token */
		});
		// POST again to /oauth2/token, update tokens…
	}
	return tokens.access_token;
}
