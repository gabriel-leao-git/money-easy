import { load, save } from '../lib/storage';

// Efeitos sonoros sintetizados com Web Audio: nenhum arquivo de áudio para baixar.
let ctx: AudioContext | null = null;
let muted = load<boolean>('muted', false) === true;

function audio(): AudioContext | null {
  if (muted) return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function blip(freq: number, at: number, dur: number, type: OscillatorType, peak: number) {
  const c = audio();
  if (!c) return;
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sound = {
  /** "plim" de moeda; o combo deixa o som mais agudo */
  coin(mult = 1) {
    const base = 988 * (1 + (mult - 1) * 0.07);
    blip(base, 0, 0.07, 'square', 0.03);
    blip(base * 1.335, 0.05, 0.16, 'square', 0.03);
  },
  buy() {
    [523, 659, 784].forEach((f, i) => blip(f, i * 0.06, 0.12, 'triangle', 0.08));
  },
  cash() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => blip(f, i * 0.07, 0.2, 'triangle', 0.08));
  },
  golden() {
    [1319, 1568, 2093, 2637].forEach((f, i) => blip(f, i * 0.05, 0.14, 'sine', 0.07));
  },
  achievement() {
    [784, 988, 1175].forEach((f, i) => blip(f, i * 0.09, 0.22, 'sine', 0.06));
  },
  login() {
    [392, 523, 659].forEach((f, i) => blip(f, i * 0.08, 0.18, 'triangle', 0.06));
  },
  isMuted: () => muted,
  setMuted(value: boolean) {
    muted = value;
    save('muted', value);
  },
};

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // sem suporte (iOS): segue sem vibração
  }
}
