// Procedural audio via Web Audio API — no asset files needed.
let ctx: AudioContext | null = null;
let suctionMaster: GainNode | null = null;
let motorOscs: OscillatorNode[] = [];   // fundamental + harmonics (need pitch-bend)
let suctionBuffers: AudioBufferSourceNode[] = [];

const MOTOR_BASE_HZ = 230; // realistic vacuum motor fundamental

const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
};

const makeNoiseBuffer = (c: AudioContext, seconds = 2): AudioBuffer => {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf;
};

export const startSuction = () => {
  const c = getCtx();
  if (!c || suctionMaster) return;

  suctionMaster = c.createGain();
  suctionMaster.gain.value = 0;
  suctionMaster.connect(c.destination);

  // ── Motor whine: sawtooth fundamental + 3 harmonics ──────────────────────
  // Sawtooth naturally has all harmonics; we stack them with harmonic rolloff
  // for a thick electric-motor character.
  const harmonicGains = [0.28, 0.14, 0.07, 0.04];
  harmonicGains.forEach((gainVal, i) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = MOTOR_BASE_HZ * (i + 1);
    // Slight bandpass per harmonic to tame harshness while keeping presence
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = MOTOR_BASE_HZ * (i + 1);
    bp.Q.value = 2.5;
    const g = c.createGain();
    g.gain.value = gainVal;
    osc.connect(bp).connect(g).connect(suctionMaster!);
    osc.start();
    motorOscs.push(osc);
  });

  // ── High whine: characteristic 2–3 kHz motor screech ─────────────────────
  const whineOsc = c.createOscillator();
  whineOsc.type = "sine";
  whineOsc.frequency.value = 2600;
  const whineGain = c.createGain();
  whineGain.gain.value = 0.055;
  whineOsc.connect(whineGain).connect(suctionMaster);
  whineOsc.start();
  motorOscs.push(whineOsc); // also pitch-bent in setSuctionIntensity

  // ── Air rush: highpass-filtered white noise ───────────────────────────────
  // This gives the "whoooosh" of suction air, dominant above ~1.5 kHz.
  const rushNoise = c.createBufferSource();
  rushNoise.buffer = makeNoiseBuffer(c);
  rushNoise.loop = true;
  const rushHp = c.createBiquadFilter();
  rushHp.type = "highpass";
  rushHp.frequency.value = 1500;
  rushHp.Q.value = 0.4;
  const rushGain = c.createGain();
  rushGain.gain.value = 0.32;
  rushNoise.connect(rushHp).connect(rushGain).connect(suctionMaster);
  rushNoise.start();
  suctionBuffers.push(rushNoise);

  // ── Low rumble: lowpass-filtered noise ───────────────────────────────────
  // Motor housing vibration felt more than heard.
  const rumbleNoise = c.createBufferSource();
  rumbleNoise.buffer = makeNoiseBuffer(c);
  rumbleNoise.loop = true;
  const rumbleLp = c.createBiquadFilter();
  rumbleLp.type = "lowpass";
  rumbleLp.frequency.value = 190;
  const rumbleGain = c.createGain();
  rumbleGain.gain.value = 0.22;
  rumbleNoise.connect(rumbleLp).connect(rumbleGain).connect(suctionMaster);
  rumbleNoise.start();
  suctionBuffers.push(rumbleNoise);
};

export const setSuctionIntensity = (v: number) => {
  if (!suctionMaster || !ctx) return;
  const clamped = Math.max(0, Math.min(1, v));

  // Volume ramp
  suctionMaster.gain.linearRampToValueAtTime(clamped * 0.65, ctx.currentTime + 0.08);

  // Pitch rise with speed: up to ~10% higher at max intensity
  // Simulates motor RPM increasing as the vacuum works harder.
  const pitchScale = 1 + clamped * 0.1;
  motorOscs.forEach((osc, i) => {
    const isWhine = i >= 4;
    const base = isWhine ? 2600 : MOTOR_BASE_HZ * (i + 1);
    osc.frequency.linearRampToValueAtTime(base * pitchScale, ctx!.currentTime + 0.12);
  });
};

export const stopSuction = () => {
  motorOscs.forEach((o) => { try { o.stop(); } catch { /* noop */ } o.disconnect(); });
  motorOscs = [];
  suctionBuffers.forEach((b) => { try { b.stop(); } catch { /* noop */ } b.disconnect(); });
  suctionBuffers = [];
  if (suctionMaster) { suctionMaster.disconnect(); suctionMaster = null; }
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
