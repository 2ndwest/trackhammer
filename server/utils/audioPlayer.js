import { spawn } from "child_process";
import net from "net";
import path from "path"
import { timeCallback, playNextSong } from "../sockets/playback.js";

const PIPE = "\\\\.\\pipe\\mpv-pipe-" + Math.random().toString(36).slice(2);

class AudioPlayer {
	constructor() {
		this.TRACK_DIR = process.cwd() + "/tracks/";

		this.mpv = spawn(
		  "mpv",
		  ["--no-terminal", "--idle=yes", `--input-ipc-server=${PIPE}`],
		  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true }
		);
		this.mpv.stdout.setEncoding("utf8");
		this.mpv.stderr.setEncoding("utf8");
		this.mpv.stdout.on("data", d => process.stdout.write("[mpv] " + d));
		this.mpv.stderr.on("data", d => process.stderr.write("[mpv:err] " + d));
		this.mpv.on("exit", c => console.log("mpv exited with code", c));
		this.lastElapsed = 0;
    this.ignoreNextEnd = false;

    process.on("exit", () => this.stop());

    this._queue = [];
    this.ipcReady = this.connectIpc();

    (async () => {
      this.sock = await this.ipcReady;
      this.sock.setEncoding("utf8");
      this.sock.on("data", (data) => {
        for (const line of data.split(/\r?\n/)) {
          if (!line) continue;
          try {
            const msg = JSON.parse(line);
            if (msg.event === "property-change" && msg.name === "time-pos") {
              timeCallback(msg.data);
            }
            if (msg.event === "end-file") {
              if (!this.ignoreNextEnd) {playNextSong?.();}
              this.ignoreNextEnd = false;
            }
          } catch {}
        }
      });

      // Start time updates from mpv
      this.send(["observe_property", 1, "time-pos"]);

      // Flush any commands queued before socket was ready
      while (this._queue.length && this.sock && !this.sock.destroyed) {
        this.sock.write(this._queue.shift());
      }
    })();

    this._installExitHooks();
	}

  send = (cmd) => {
    const payload = Array.isArray(cmd) ? { command: cmd } : cmd;
    const line = JSON.stringify(payload) + "\n";
    if (this.sock && !this.sock.destroyed) this.sock.write(line);
    else this._queue.push(line);
  };

  connectIpc = () =>
  new Promise((resolve, reject) => {
    let tries = 0;
    const attempt = () => {
    const sock = net.connect(PIPE, () => resolve(sock));
    sock.on("error", () => {
      if (++tries < 50) setTimeout(attempt, 100);
      else reject(new Error("Failed to connect to mpv IPC"));
    });
    };
    attempt();
  });

	play(trackName) {
		const trackPath = path.resolve(this.TRACK_DIR, `${trackName}.mp3`).replace(/\\/g, "/")
		console.log(`Playing track: ${trackName}`);
		this.send({ command: ["loadfile", trackPath, "replace"] });
    this.changePlaybackState(true);
		this.lastElapsed = 0;
	}

	changePlaybackState(state) {
		if (state) this.send({ command: ["set_property", "pause", false] });
		else this.send({ command: ["set_property", "pause", true] });
	}

	stop() {
    this.send({ command: ["quit"] });
    console.log("Playback Stopped");
	}

  setIgnoreNextEnd(val) {this.ignoreNextEnd = val}

	setVolume(percent) { this.send(["set_property", "volume", percent]); }
	mute() { this.send(["set_property", "mute", true]); }
	unmute() { this.send(["set_property", "mute", false]); }

  _installExitHooks() {
    if (this._hooksInstalled) return;
    this._hooksInstalled = true;
    this._cleaned = false;

    const cleanup = () => {
      // Best-effort soft shutdown
      try { this.send(["set_property", "pause", true]); } catch {}
      try { this.send(["stop"]); } catch {}
      try { this.send(["quit"]); } catch {}

      try { this.sock?.end(); } catch {}
    };

    // Signals we’re likely to see on Windows & Node
    ["SIGINT", "SIGTERM", "SIGBREAK"].forEach(sig => {
      try {
        process.on(sig, () => { cleanup(); setTimeout(() => process.exit(0), 75); });
      } catch {}
    });

    // Last-chance hooks (note: 'exit' cannot await; do sync work only)
    process.on("beforeExit", cleanup);
    process.on("exit", cleanup);
  }
}

export default new AudioPlayer();