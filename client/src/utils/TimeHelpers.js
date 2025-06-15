// Takes time input in seconds and returns a string "HH:MM:SS"
export function getTimeString(time) {
	let hours = "";
	let minutes = "";
	let seconds = "";
	if (time > 3600) {
		hours = Math.floor(time / 3600) + ":";
	}
	minutes = Math.floor((time % 3600) / 60) + ":";
	if (minutes.length === 2 && (hours !== 0 || minutes !== 0)) {
		minutes = "0" + minutes; // Append 0 if single digits
	}
	seconds = time % 60;
	if (seconds < 10) {
		seconds = "0" + seconds; // Append 0 if single digits
	}

	return hours + minutes + seconds;
}

export function calculateCompletionPercentage() {}
