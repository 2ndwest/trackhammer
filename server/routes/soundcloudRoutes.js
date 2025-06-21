import { initWithCode } from "../soundcloudAuth.js";

export default function setupSoundCloudRoute(app) {
	app.get("/callback", async (req, res) => {
		console.log("LINE 5");
		const code = req.query.code;
		if (!code) {
			return res.status(400).send("Missing `code` in query string");
		}
		try {
			await initWithCode(code); // exchanges & persists SC tokens
			return res.redirect("/");
		} catch (err) {
			console.error("OAuth exchange failed:", err);
			return res.status(500).send("Authentication error");
		}
	});
}
