import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';

type ParallaxValues = {
  /** -1..1, horizontal: inclinação do celular, mouse ou deriva automática */
  x: MotionValue<number>;
  /** -1..1, vertical */
  y: MotionValue<number>;
  scrollY: MotionValue<number>;
  reduce: boolean;
};

const ParallaxContext = createContext<ParallaxValues | null>(null);
const clamp = (v: number) => Math.max(-1, Math.min(1, v));
const IDLE_MS = 2500;

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 50, damping: 16, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 50, damping: 16, mass: 0.8 });
  const { scrollY } = useScroll();

  useEffect(() => {
    if (reduce) {
      rawX.set(0);
      rawY.set(0);
      return;
    }
    let lastInput = Number.NEGATIVE_INFINITY;

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      lastInput = performance.now();
      rawX.set(clamp((e.clientX / window.innerWidth) * 2 - 1));
      rawY.set(clamp((e.clientY / window.innerHeight) * 2 - 1));
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma === null || e.beta === null) return;
      lastInput = performance.now();
      rawX.set(clamp(e.gamma / 25));
      rawY.set(clamp((e.beta - 45) / 25));
    };
    // Sem mouse nem giroscópio (ou parado), a cena deriva sozinha para nunca ficar estática.
    let frame = 0;
    const drift = (t: number) => {
      if (t - lastInput > IDLE_MS) {
        rawX.set(Math.sin(t / 3400) * 0.35);
        rawY.set(Math.cos(t / 4300) * 0.25);
      }
      frame = requestAnimationFrame(drift);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onTilt);
    frame = requestAnimationFrame(drift);
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
      cancelAnimationFrame(frame);
    };
  }, [reduce, rawX, rawY]);

  const value = useMemo(() => ({ x, y, scrollY, reduce }), [x, y, scrollY, reduce]);
  return <ParallaxContext.Provider value={value}>{children}</ParallaxContext.Provider>;
}

export function useParallax(): ParallaxValues {
  const ctx = useContext(ParallaxContext);
  if (!ctx) throw new Error('useParallax precisa estar dentro do ParallaxProvider');
  return ctx;
}

/**
 * Deslocamento de uma camada. `depth` maior = mais perto da câmera = mexe mais.
 * `scroll` controla quanto a camada sobe quando a página rola.
 */
export function useDepth(depth: number, range = 24, scroll = 0.15) {
  const { x, y, scrollY, reduce } = useParallax();
  const k = reduce ? 0 : 1;
  const tx = useTransform(x, (v) => v * depth * range * k);
  const ty = useTransform([y, scrollY], ([py, sy]: number[]) =>
    (py * depth * range * 0.7 - Math.min(sy, 900) * scroll * depth) * k,
  );
  return { x: tx, y: ty };
}

/** iOS só libera o giroscópio depois de um gesto do usuário. Chamar dentro de um clique. */
export function requestTiltPermission() {
  const DOE = (window as unknown as {
    DeviceOrientationEvent?: { requestPermission?: () => Promise<string> };
  }).DeviceOrientationEvent;
  if (typeof DOE?.requestPermission === 'function') {
    DOE.requestPermission().catch(() => undefined);
  }
}
