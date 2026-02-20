/**
 * Sound effects utility using the Web Audio API.
 * All sounds are generated programmatically — no external audio files.
 * Gracefully degrades to no-op on unsupported devices.
 *
 * CRITICAL: All sound functions must be fully synchronous. Using async/await
 * causes the AudioContext to be created in a microtask, outside the browser's
 * user-gesture window. This produces a context with 0 destination outputs
 * on Edge/Safari, silently discarding all audio.
 */

const SOUND_KEY = 'soundEnabled';

let ctx: AudioContext | null = null;

/**
 * Get or create the shared AudioContext.
 * MUST be called synchronously from a user-gesture callback.
 */
function getCtx(): AudioContext | null {
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Kick off resume if suspended (for iOS Safari). Fire-and-forget is fine —
    // the context accepts scheduled nodes immediately, they just won't play
    // until resume() settles. On the very first gesture this means the first
    // sound may be clipped, but subsequent ones work perfectly.
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(SOUND_KEY) !== 'false';
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(SOUND_KEY, String(enabled));
}

/** Play a tone using an oscillator node. Fully synchronous. */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  delay: number = 0,
): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, ac.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + duration / 1000);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(ac.currentTime + delay);
  osc.stop(ac.currentTime + delay + duration / 1000 + 0.05);
}

/** Short bright "tick" — when tapping a coin denomination button */
export function playCoinTap(): void {
  playTone(880, 120, 'sine', 0.35);
}

/** Satisfying "clink" — when coin lands in jar */
export function playCoinDrop(): void {
  playTone(1200, 150, 'sine', 0.3);
  playTone(800, 180, 'triangle', 0.25, 0.015);
}

/** Subtle "whoosh" during coin flight — filtered noise */
export function playCoinArc(): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;

  const bufferSize = ac.sampleRate * 0.2;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }

  const source = ac.createBufferSource();
  source.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(400, ac.currentTime);
  filter.frequency.linearRampToValueAtTime(2000, ac.currentTime + 0.15);
  filter.Q.value = 2;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(0.18, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  source.start();
  source.stop(ac.currentTime + 0.3);
}

/** Cheerful ascending chime — task completion / reward redemption */
export function playSuccess(): void {
  if (!isSoundEnabled()) return;
  // C5, E5, G5 — major chord ascending
  playTone(523, 160, 'sine', 0.3, 0);
  playTone(659, 160, 'sine', 0.3, 0.12);
  playTone(784, 220, 'sine', 0.35, 0.24);
}

/** Soft "pop" — switching kids */
export function playKidSwitch(): void {
  playTone(600, 80, 'sine', 0.25);
}

/** Gentle low tone — insufficient points / validation error */
export function playError(): void {
  if (!isSoundEnabled()) return;
  const ac = getCtx();
  if (!ac) return;

  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ac.currentTime);
  // Slight vibrato
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  lfo.frequency.value = 8;
  lfoGain.gain.value = 5;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  lfo.start();

  gain.gain.setValueAtTime(0.3, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.3);
  lfo.stop(ac.currentTime + 0.3);
}
