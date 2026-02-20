/**
 * Sound effects utility using the Web Audio API.
 * All sounds are generated programmatically — no external audio files.
 * Gracefully degrades to no-op on unsupported devices.
 */

const SOUND_KEY = 'soundEnabled';

let ctx: AudioContext | null = null;

/** Lazily get or create the AudioContext */
function getCtx(): AudioContext | null {
  try {
    if (!ctx || ctx.state === 'closed') {
      ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    // Resume if suspended (browser autoplay policy)
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

/** Play a tone using an oscillator node */
function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  delay: number = 0,
): void {
  const ac = getCtx();
  if (!ac || !isSoundEnabled()) return;

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
  playTone(800, 50, 'sine', 0.12);
}

/** Satisfying "clink" — when coin lands in jar */
export function playCoinDrop(): void {
  const ac = getCtx();
  if (!ac || !isSoundEnabled()) return;

  // Two overlapping tones for a richer clink
  playTone(1200, 80, 'sine', 0.1);
  playTone(800, 100, 'triangle', 0.08, 0.015);
}

/** Subtle "whoosh" during coin flight — filtered noise */
export function playCoinArc(): void {
  const ac = getCtx();
  if (!ac || !isSoundEnabled()) return;

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
  gain.gain.setValueAtTime(0.06, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.2);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  source.start();
  source.stop(ac.currentTime + 0.25);
}

/** Cheerful ascending chime — task completion / reward redemption */
export function playSuccess(): void {
  if (!isSoundEnabled()) return;
  // C5, E5, G5 — major chord ascending
  playTone(523, 80, 'sine', 0.1, 0);
  playTone(659, 80, 'sine', 0.1, 0.1);
  playTone(784, 120, 'sine', 0.12, 0.2);
}

/** Soft "pop" — switching kids */
export function playKidSwitch(): void {
  playTone(600, 30, 'sine', 0.1);
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

  gain.gain.setValueAtTime(0.12, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + 0.2);
  lfo.stop(ac.currentTime + 0.2);
}
