// Procedural audio via Web Audio API — no asset files needed.
let ctx: AudioContext | null = null;
let suctionGain: GainNode | null = null;
let suctionOsc: OscillatorNode | null = null;
let suctionNoise: AudioBufferSourceNode | null = null;

const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
};

const makeNoiseBuffer = (c: AudioContext, seconds = 1): AudioBuffer => {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
};

export const startSuction = () => {
  const c = getCtx();
  if (!c) return;
  if (suctionGain) return;
  suctionGain = c.createGain();
  suctionGain.gain.value = 0.0;
  suctionGain.connect(c.destination);

  // Low rumble oscillator
  suctionOsc = c.createOscillator();
  suctionOsc.type = "sawtooth";
  suctionOsc.frequency.value = 110;
  const oscGain = c.createGain();
  oscGain.gain.value = 0.04;
  suctionOsc.connect(oscGain).connect(suctionGain);
  suctionOsc.start();

  // White noise for "suction" hiss
  const noise = c.createBufferSource();
  noise.buffer = makeNoiseBuffer(c, 2);
  noise.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 800;
  filter.Q.value = 0.8;
  const noiseGain = c.createGain();
  noiseGain.gain.value = 0.08;
  noise.connect(filter).connect(noiseGain).connect(suctionGain);
  noise.start();
  suctionNoise = noise;
};

export const setSuctionIntensity = (v: number) => {
  if (!suctionGain || !ctx) return;
  const target = Math.max(0, Math.min(1, v)) * 0.5;
  suctionGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.05);
};

export const stopSuction = () => {
  if (suctionOsc) {
    try { suctionOsc.stop(); } catch { /* noop */ }
    suctionOsc.disconnect();
    suctionOsc = null;
  }
  if (suctionNoise) {
    try { suctionNoise.stop(); } catch { /* noop */ }
    suctionNoise.disconnect();
    suctionNoise = null;
  }
  if (suctionGain) {
    suctionGain.disconnect();
    suctionGain = null;
  }
};

export const playThud = () => {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  const g = c.createGain();
  g.gain.setValueAtTime(0.4, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(g).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.22);
};

export const playVictory = () => {
  const c = getCtx();
  if (!c) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const now = c.currentTime;
  notes.forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const g = c.createGain();
    const t = now + i * 0.12;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.25, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.connect(g).connect(c.destination);
    osc.start(t);
    osc.stop(t + 0.45);
  });
};

export const resumeAudio = async () => {
  const c = getCtx();
  if (c && c.state === "suspended") await c.resume();
};
