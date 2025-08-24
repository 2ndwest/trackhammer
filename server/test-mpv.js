// test-mpv.mjs
import MPVModule from 'node-mpv';
const MPV = MPVModule.default ?? MPVModule;

const mpv = new MPV(
  {
    audio_only: true,
    auto_restart: false,
    time_update: 0.25,
    ipcCommand: '\\\\.\\pipe\\mpv-audio-test',
    // binary: 'C:\\Path\\to\\mpv.exe', // uncomment if mpv isn't in PATH
  },
  {
    idle: 'yes',
    'force-window': 'no',
    'gapless-audio': 'yes',
    vo: 'null',
    ao: process.platform === 'win32' ? 'wasapi' : 'auto',
  }
);

mpv.on('statuschange', s => console.log('[status]', s));
mpv.on('timeposition', t => console.log('[time]', t));
mpv.on('stopped', () => console.log('[event] stopped'));
mpv.on('error', e => console.error('[event] error', e));
mpv.on('crashed', e => console.error('[event] crashed', e));

const file = "C:\\Users\\putz\\Music\\trackhammer\\server\\tracks\\Drown The Traitor In Slowmo.mp3";

await mpv.load(file, 'replace');
await mpv.play();
await mpv.volume(70);  // set a comfortable volume
await mpv.command('set', 'mute', 'no');

console.log("Now playing:", file);

setTimeout(async () => {
  console.log('Stopping after 15s…');
  await mpv.stop();
  process.exit(0);
}, 15000);
