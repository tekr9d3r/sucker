let ctx: AudioContext | null = null;

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
  if (!c) return;

  startMelody();

  // Load MP3 and start movement sound (async, starts playing once buffer is ready)
  loadMovementBuffer().then((buf) => {
    if (buf && !movementSource) startMovementSound();
  });
};

export const stopSuction = () => {
  stopMelody();
  stopMovementSound();
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
