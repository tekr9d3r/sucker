// Procedural audio via Web Audio API — no asset files needed.
let ctx: AudioContext | null = null;
let suctionMaster: GainNode | null = null;
let motorOscs: OscillatorNode[] = [];
let suctionBuffers: AudioBufferSourceNode[] = [];

// ── Movement sound (MP3) ──────────────────────────────────────────────────────
let movementSource: AudioBufferSourceNode | null = null;
let movementGain: GainNode | null = null;
let movementBuffer: AudioBuffer | null = null;
let movementBufferLoading = false;

async function loadMovementBuffer(): Promise<AudioBuffer | null> {
  if (movementBuffer) return movementBuffer;
  if (movementBufferLoading) return null;
  movementBufferLoading = true;
  try {
    const res = await fetch("/sound-sucker.mp3");
    const arrayBuf = await res.arrayBuffer();
    const c = getCtx();
    if (!c) return null;
    movementBuffer = await c.decodeAudioData(arrayBuf);
    return movementBuffer;
  } catch {
    return null;
  }
}

function startMovementSound(): void {
  const c = getCtx();
  if (!c || movementSource) return;
  const buf = movementBuffer;
  if (!buf) return;
  movementGain = c.createGain();
  movementGain.gain.value = 0;
  movementGain.connect(c.destination);
  movementSource = c.createBufferSource();
  movementSource.buffer = buf;
  movementSource.loop = true;
  movementSource.connect(movementGain);
  movementSource.start();
}

function stopMovementSound(): void {
  if (movementSource) {
    try { movementSource.stop(); } catch { /* noop */ }
    movementSource.disconnect();
    movementSource = null;
  }
  if (movementGain) { movementGain.disconnect(); movementGain = null; }
}

// ── Melody state ──────────────────────────────────────────────────────────────
let melodyGain: GainNode | null = null;
let melodyActive = false;
let melodyLoopTimer: ReturnType<typeof setTimeout> | null = null;

const MOTOR_BASE_HZ = 230;

const BPM = 118;
const SPB = 60 / BPM; // seconds per beat

// Upbeat 16-beat loop in C major. [freq_hz, beats] — 0 = rest.
const MELODY: [number, number][] = [
  [659.25, 0.5],  // E5
  [587.33, 0.5],  // D5
  [523.25, 1.0],  // C5
  [392.00, 0.5],  // G4
  [440.00, 0.5],  // A4
  [523.25, 1.0],  // C5
  [659.25, 0.5],  // E5
  [783.99, 0.5],  // G5
  [659.25, 0.5],  // E5
  [587.33, 0.5],  // D5
  [523.25, 2.0],  // C5 (held)
  [0,      0.5],  // rest
  [440.00, 0.5],  // A4
  [523.25, 0.5],  // C5
  [587.33, 0.5],  // D5
  [659.25, 1.0],  // E5
  [587.33, 0.5],  // D5
  [523.25, 0.5],  // C5
  [493.88, 0.5],  // B4
  [440.00, 0.5],  // A4
  [523.25, 2.0],  // C5 (held)
  [0,      1.0],  // rest
];

const MELODY_DUR_S = MELODY.reduce((s, [, b]) => s + b * SPB, 0);

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

function scheduleMelodyLoop(c: AudioContext, startAt: number): void {
  if (!melodyActive || !melodyGain) return;
  let t = startAt;
  for (const [freq, beats] of MELODY) {
    if (freq > 0) {
      const dur = beats * SPB;
      const osc = c.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const g = c.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.018);
      g.gain.setValueAtTime(0.17, t + dur * 0.72);
      g.gain.linearRampToValueAtTime(0, t + dur * 0.9);
      osc.connect(g).connect(melodyGain!);
      osc.start(t);
      osc.stop(t + dur);
    }
    t += beats * SPB;
  }
  // Re-schedule 150 ms before loop ends to avoid gaps
  const msUntilReschedule = Math.max(0, (startAt + MELODY_DUR_S - c.currentTime - 0.15) * 1000);
  melodyLoopTimer = setTimeout(() => {
    const c2 = getCtx();
    if (c2 && melodyActive) scheduleMelodyLoop(c2, startAt + MELODY_DUR_S);
  }, msUntilReschedule);
}

function startMelody(): void {
  const c = getCtx();
  if (!c || melodyActive) return;
  melodyActive = true;
  melodyGain = c.createGain();
  melodyGain.gain.value = 0.38;
  melodyGain.connect(c.destination);
  scheduleMelodyLoop(c, c.currentTime + 0.05);
}

function stopMelody(): void {
  melodyActive = false;
  if (melodyLoopTimer !== null) { clearTimeout(melodyLoopTimer); melodyLoopTimer = null; }
  if (melodyGain) {
    const c = getCtx();
    if (c) melodyGain.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
    setTimeout(() => { melodyGain?.disconnect(); melodyGain = null; }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export const startSuction = () => {
  const c = getCtx();
  if (!c || suctionMaster) return;

  suctionMaster = c.createGain();
  suctionMaster.gain.value = 0;
  suctionMaster.connect(c.destination);

  // Motor whine: sawtooth fundamental + 3 harmonics with bandpass shaping
  const harmonicGains = [0.28, 0.14, 0.07, 0.04];
  harmonicGains.forEach((gainVal, i) => {
    const osc = c.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = MOTOR_BASE_HZ * (i + 1);
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

  // High whine: characteristic 2–3 kHz motor screech
  const whineOsc = c.createOscillator();
  whineOsc.type = "sine";
  whineOsc.frequency.value = 2600;
  const whineGain = c.createGain();
  whineGain.gain.value = 0.055;
  whineOsc.connect(whineGain).connect(suctionMaster);
  whineOsc.start();
  motorOscs.push(whineOsc);

  // Air rush: highpass-filtered white noise
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

  // Low rumble: lowpass-filtered noise
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

  startMelody();

  // Load MP3 and start movement sound (async, starts playing once buffer is ready)
  loadMovementBuffer().then((buf) => {
    if (buf && !movementSource) startMovementSound();
  });
};

export const setSuctionIntensity = (v: number) => {
  if (!suctionMaster || !ctx) return;
  const clamped = Math.max(0, Math.min(1, v));

  suctionMaster.gain.linearRampToValueAtTime(clamped * 0.65, ctx.currentTime + 0.08);

  // Subtle pitch rise: only 2% at max intensity
  const pitchScale = 1 + clamped * 0.02;
  motorOscs.forEach((osc, i) => {
    const isWhine = i >= 4;
    const base = isWhine ? 2600 : MOTOR_BASE_HZ * (i + 1);
    osc.frequency.linearRampToValueAtTime(base * pitchScale, ctx!.currentTime + 0.15);
  });
};

export const stopSuction = () => {
  stopMelody();
  stopMovementSound();
  motorOscs.forEach((o) => { try { o.stop(); } catch { /* noop */ } o.disconnect(); });
  motorOscs = [];
  suctionBuffers.forEach((b) => { try { b.stop(); } catch { /* noop */ } b.disconnect(); });
  suctionBuffers = [];
  if (suctionMaster) { suctionMaster.disconnect(); suctionMaster = null; }
};

// v: 0 = silent (game not playing), 0–1 = idle-to-fast movement
export const setMovementIntensity = (v: number) => {
  if (!movementGain || !ctx) return;
  const clamped = Math.max(0, Math.min(1, v));
  // Quiet when still (0.12), loud when moving fast (0.85)
  const targetGain = clamped < 0.01 ? 0 : 0.12 + clamped * 0.73;
  movementGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.1);
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
