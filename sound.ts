// Web Audio API synthesized sound effects for Field of Wonders feedback

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  delay = 0,
  volume = 0.08
): void {
  const ctx = getContext();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playCorrectAnswerSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(523.25, 0.14, 'triangle', 0, 0.08);
  playTone(659.25, 0.18, 'triangle', 0.09, 0.09);
}

export function playWrongAnswerSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(220, 0.16, 'sine', 0, 0.07);
  playTone(185, 0.22, 'sine', 0.1, 0.06);
}

export function playLetterHitSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(587.33, 0.12, 'triangle', 0, 0.08);
  playTone(880, 0.22, 'triangle', 0.08, 0.09);
}

export function playLetterMissSound(enabled: boolean): void {
  if (!enabled) return;
  playTone(260, 0.14, 'sine', 0, 0.06);
}

export function playWordSolvedSound(enabled: boolean): void {
  if (!enabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((n, idx) => {
    playTone(n, 0.25, 'triangle', idx * 0.09, 0.09);
  });
}
