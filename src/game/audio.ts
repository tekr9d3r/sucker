let ctx: AudioContext | null = null;

// ── Melody (main background track) ───────────────────────────────────────────
let melodySource: AudioBufferSourceNode | null = null;
let melodyGain: GainNode | null = null;
let melodyBuffer: AudioBuffer | null = null;
let melodyBufferLoading = false;

async function loadMelodyBuffer(): Promise<AudioBuffer | null> {
  if (melodyBuffer) return melodyBuffer;
  if (melodyBufferLoading) return null;
  melodyBufferLoading = true;
  try {
    const res = await fetch("/sucker-song-melody.mp3");
    const arrayBuf = await res.arrayBuffer();
    const c = getCtx();
    if (!c) return null;
    melodyBuffer = await c.decodeAudioData(arrayBuf);
    return melodyBuffer;
  } catch {
    return null;
  }
}

function startMelodySound(): void {
  const c = getCtx();
  if (!c || melodySource) return;
  const buf = melodyBuffer;
  if (!buf) return;
  melodyGain = c.createGain();
  melodyGain.gain.value = 0.85;
  melodyGain.connect(c.destination);
  melodySource = c.createBufferSource();
  melodySource.buffer = buf;
  melodySource.loop = true;
  melodySource.connect(melodyGain);
  melodySource.start();
}

function stopMelodySound(): void {
  if (melodySource) {
    try { melodySource.stop(); } catch { /* noop */ }
    melodySource.disconnect();
    melodySource = null;
  }
  if (melodyGain) { melodyGain.disconnect(); melodyGain = null; }
}

// ── Movement sound (vacuum) ───────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

const getCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
};

export const startSuction = () => {
  const c = getCtx();
  if (!c) return;
  loadMelodyBuffer().then((buf) => {
    if (buf && !melodySource) startMelodySound();
  });
  loadMovementBuffer().then((buf) => {
    if (buf && !movementSource) startMovementSound();
  });
};

export const stopSuction = () => {
  stopMelodySound();
  stopMovementSound();
};

// v: 0 = silent (game not playing), 0–1 = idle-to-fast
// Vacuum is secondary to melody so max gain is kept lower (0.12 max).
// Uses setTargetAtTime so repeated per-frame calls don't cause ramp glitches.
export const setMovementIntensity = (v: number) => {
  if (!movementGain || !ctx) return;
  const clamped = Math.max(0, Math.min(1, v));
  const targetGain = clamped * 0.12;
  // Time constant: ~0.05s to get louder (snappy), ~0.18s to get quieter (trailing off).
  // setTargetAtTime reaches ~95% of target after 3× the time constant.
  const tau = targetGain > movementGain.gain.value ? 0.05 : 0.18;
  movementGain.gain.cancelScheduledValues(ctx.currentTime);
  movementGain.gain.setValueAtTime(movementGain.gain.value, ctx.currentTime);
  movementGain.gain.setTargetAtTime(targetGain, ctx.currentTime, tau);
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
