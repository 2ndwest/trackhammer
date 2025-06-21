// Temporary song in player
let activeSong = {
	link: "https://google.com",
	track: "Orca",
	artist: "Bicep",
	duration: 274,
	coverPath: "static/img/bicep.jpg",
	key: 4,
};

let volume = 5;
let isMuted = false;
let isPlaying = false;
let progressSeconds = 120; // Integer in seconds

// socket is the individual connection, io is all connected clients
export default function setupPlaybackLogic(socket, io) {
	socket.emit("updateSong", activeSong);
	socket.emit("updateVolume", volume);
	socket.emit("updateMutedState", isMuted);
	socket.emit("updateProgress", progressSeconds);

	socket.on("lowerVolume", () => {
		if (volume > 0) volume -= 0.5;
		socket.emit("updateVolume", volume);
	});

	socket.on("raiseVolume", () => {
		if (volume < 10) volume += 0.5;
		io.emit("updateVolume", volume);
	});

	socket.on("changeMutedState", () => {
		isMuted = !isMuted;
		io.emit("updateMutedState", isMuted);
	});

	socket.on("changePlaybackState", () => {
		isPlaying = !isPlaying;
		io.emit("updatePlaybackState", isPlaying);
	});

	socket.on("resetSongProgress", () => {
		progressSeconds = 0;
		io.emit("updateProgress", progressSeconds);
	});

	socket.on("skipSong", () => {
		progressSeconds = activeSong.duration;
		io.emit("updateProgress", progressSeconds);
	});
}
