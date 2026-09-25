// Génère la bande-son originale de la vidéo promo (aucune musique sous licence).
// Usage : node scripts/generate-soundtrack.cjs  →  public/audio/*.mp3
const fs = require('fs');
const { execFileSync } = require('child_process');
const path = require('path');

const RATE = 44100;
const BPM = 120;
const BEAT = 60 / BPM;
const STEP = BEAT / 4;
const out = path.join(__dirname, '..', 'public', 'audio');

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const buffer = (seconds) => ({ L: new Float32Array(Math.ceil(seconds * RATE)), R: new Float32Array(Math.ceil(seconds * RATE)) });
let seed = 7;
const noise = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 31 - 1; };

function add(buf, start, seconds, pan, fn) {
  const i0 = Math.floor(start * RATE);
  const n = Math.floor(seconds * RATE);
  const gl = Math.cos((pan + 1) * Math.PI / 4), gr = Math.sin((pan + 1) * Math.PI / 4);
  for (let i = 0; i < n && i0 + i < buf.L.length; i++) {
    const v = fn(i / RATE);
    buf.L[i0 + i] += v * gl; buf.R[i0 + i] += v * gr;
  }
}

const kick = (buf, t, g = 0.9) => add(buf, t, 0.35, 0, (x) => {
  const f = 45 + 110 * Math.exp(-x * 28);
  return g * Math.sin(2 * Math.PI * f * x - 1.5 * Math.exp(-x * 28)) * Math.exp(-x * 9);
});
const shaker = (buf, t, g) => { let lp = 0; add(buf, t, 0.09, 0.35, (x) => { const n = noise(); lp += 0.5 * (n - lp); return g * (n - lp) * Math.exp(-x * 55); }); };
const rim = (buf, t, g = 0.25) => add(buf, t, 0.06, -0.3, (x) => g * (Math.sin(2 * Math.PI * 1750 * x) + 0.5 * noise()) * Math.exp(-x * 90));
const bass = (buf, t, midi, len, g = 0.42) => add(buf, t, len, 0, (x) => {
  const f = hz(midi), env = Math.min(1, x * 200) * Math.exp(-x * 2.2);
  return g * Math.tanh(1.6 * (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(4 * Math.PI * f * x))) * env;
});
// Timbre de kalimba : partiels inharmoniques qui s'éteignent vite.
const kalimba = (buf, t, midi, g = 0.22, pan = 0) => add(buf, t, 1.4, pan, (x) => {
  const f = hz(midi);
  return g * (Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 3.5) + 0.35 * Math.sin(2 * Math.PI * f * 5.4 * x) * Math.exp(-x * 18)) * Math.min(1, x * 400);
});
const pad = (buf, t, notes, len, g = 0.05) => add(buf, t, len, 0, (x) => {
  const env = Math.min(1, x / 0.6) * Math.min(1, (len - x) / 0.8);
  return g * env * notes.reduce((s, m) => s + Math.sin(2 * Math.PI * hz(m) * x) + Math.sin(2 * Math.PI * hz(m) * 1.004 * x + 1), 0);
});

// ---- Musique : 14 s, la mineur pentatonique, grille Am – F – C – G (une mesure = 2 s).
const DURATION = 14;
const music = buffer(DURATION);
const chords = [
  { bass: 45, pad: [57, 60, 64] }, // Am
  { bass: 41, pad: [53, 57, 60] }, // F
  { bass: 48, pad: [55, 60, 64] }, // C
  { bass: 43, pad: [55, 59, 62] }, // G
];
const melody = [69, 72, 76, 74, 72, 69, 67, 69, 72, 74, 76, 79, 76, 74, 72, 74];
const bars = 6; // 0–12 s, puis accord final
for (let bar = 0; bar < bars; bar++) {
  const t0 = bar * 4 * BEAT;
  const c = chords[bar % 4];
  pad(music, t0, c.pad, 4 * BEAT + 0.3);
  // Kalimba sur des croches syncopées, dès la première mesure.
  [0, 3, 6, 8, 11, 14].forEach((s, k) => kalimba(music, t0 + s * STEP, melody[(bar * 6 + k) % melody.length], 0.2, k % 2 ? 0.4 : -0.4));
  if (bar === 0) continue; // intro aérée : les percussions arrivent avec le premier produit
  [0, 6, 8, 11].forEach((s) => kick(music, t0 + s * STEP));
  [4, 12].forEach((s) => rim(music, t0 + s * STEP));
  for (let s = 0; s < 16; s++) shaker(music, t0 + s * STEP, s % 2 ? 0.16 : 0.07);
  [[0, 3], [3, 2], [6, 2], [10, 3], [14, 2]].forEach(([s, l], k) => bass(music, t0 + s * STEP, c.bass + (k === 3 ? 12 : 0), l * STEP));
}
// Accord final qui résonne jusqu'à la fin.
const end = bars * 4 * BEAT;
kick(music, end, 1);
bass(music, end, 45, 1.8);
[69, 72, 76, 81].forEach((m, k) => kalimba(music, end + k * 0.06, m, 0.2, (k - 1.5) / 2));
pad(music, end, [57, 60, 64, 69], DURATION - end, 0.06);

// ---- Effets
const whoosh = buffer(0.6);
{ let lp = 0, lp2 = 0; add(whoosh, 0, 0.6, 0, (x) => {
  const p = x / 0.6, a = 0.02 + 0.35 * Math.sin(Math.PI * p) ** 2, n = noise();
  lp += a * (n - lp); lp2 += 0.02 * (lp - lp2);
  return 0.9 * (lp - lp2) * Math.sin(Math.PI * p) ** 1.5;
}); }
const chime = buffer(2.2);
[88, 93].forEach((m, k) => add(chime, k * 0.09, 2.1, k ? 0.3 : -0.3, (x) =>
  0.28 * (Math.sin(2 * Math.PI * hz(m) * x) + 0.3 * Math.sin(2 * Math.PI * hz(m) * 2.76 * x) * Math.exp(-x * 6)) * Math.exp(-x * 2.4) * Math.min(1, x * 800)));

function writeWav(file, { L, R }) {
  // Normalisation à -1 dBFS.
  let peak = 0; for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const gain = peak ? 0.89 / peak : 1;
  const data = Buffer.alloc(L.length * 4);
  for (let i = 0; i < L.length; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  // WAV temporaire, puis MP3 via le ffmpeg fourni par Remotion.
  const wav = path.join(out, file + '.wav'), mp3 = path.join(out, file + '.mp3');
  fs.writeFileSync(wav, Buffer.concat([h, data]));
  execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '160k', mp3]);
  fs.unlinkSync(wav);
  console.log(path.basename(mp3), Math.round(fs.statSync(mp3).size / 1024) + ' Ko');
}
const suffix = { linux: '-gnu', win32: '-msvc' }[process.platform] ?? '';
const ffmpeg = path.join(path.dirname(require.resolve(`@remotion/compositor-${process.platform}-${process.arch}${suffix}/package.json`)), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
fs.mkdirSync(out, { recursive: true });
writeWav('aod-theme', music);
writeWav('whoosh', whoosh);
writeWav('chime', chime);
