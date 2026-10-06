import { AnimatePresence, motion } from 'framer-motion';
import { useMemo } from 'react';
import { useDepth } from '../fx/parallax';

// Cenário em camadas: céu, estrelas, lua-moeda, dois skylines e moedas/notas voando.
// Cada camada se mexe numa velocidade diferente (inclinação, mouse e scroll) = parallax.

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const VIEW_W = 1600;
const VIEW_H = 600;

type SkylineProps = {
  seed: number;
  minH: number;
  maxH: number;
  color: string;
  windowColor: string;
  density: number;
  beacons?: boolean;
};

function Skyline({ seed, minH, maxH, color, windowColor, density, beacons }: SkylineProps) {
  const { buildings, windows, lights } = useMemo(() => {
    const rand = mulberry32(seed);
    const b: { x: number; y: number; w: number; h: number }[] = [];
    const w: { x: number; y: number; o: number }[] = [];
    const l: { x: number; y: number; d: number }[] = [];
    let x = -10;
    while (x < VIEW_W) {
      const bw = 44 + rand() * 72;
      const bh = minH + rand() * (maxH - minH);
      const top = VIEW_H - bh;
      b.push({ x, y: top, w: bw, h: bh });
      if (beacons && bh > maxH * 0.72) {
        b.push({ x: x + bw / 2 - 1.5, y: top - 34, w: 3, h: 34 });
        l.push({ x: x + bw / 2, y: top - 36, d: rand() * 2 });
      }
      for (let wy = top + 12; wy < VIEW_H - 14; wy += 15) {
        for (let wx = x + 8; wx < x + bw - 12; wx += 12) {
          if (rand() < density) w.push({ x: wx, y: wy, o: 0.35 + rand() * 0.65 });
        }
      }
      x += bw + rand() * 8 - 3;
    }
    return { buildings: b, windows: w, lights: l };
  }, [seed, minH, maxH, density, beacons]);

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <g fill={color}>
        {buildings.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} rx={2} />
        ))}
      </g>
      <g fill={windowColor}>
        {windows.map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={5} height={7} opacity={r.o} />
        ))}
      </g>
      {lights.map((p, i) => (
        <circle key={i} className="beacon" cx={p.x} cy={p.y} r={3.5} style={{ animationDelay: `${p.d}s` }} />
      ))}
    </svg>
  );
}

function Stars() {
  const stars = useMemo(() => {
    const rand = mulberry32(42);
    return Array.from({ length: 90 }, () => ({
      x: rand() * VIEW_W,
      y: rand() * VIEW_H,
      r: 0.5 + rand() * 1.6,
      o: 0.2 + rand() * 0.6,
      twinkle: rand() < 0.25,
      d: rand() * 3,
    }));
  }, []);
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#fff"
          opacity={s.o}
          className={s.twinkle ? 'twinkle' : undefined}
          style={s.twinkle ? { animationDelay: `${s.d}s` } : undefined}
        />
      ))}
    </svg>
  );
}

type FloatItem = { left: number; top: number; size: number; depth: number; delay: number; kind: 'coin' | 'bill' };

const FLOATS: FloatItem[] = [
  { left: 7, top: 16, size: 30, depth: 1.5, delay: 0, kind: 'coin' },
  { left: 86, top: 34, size: 24, depth: 1.1, delay: 1.2, kind: 'coin' },
  { left: 74, top: 64, size: 42, depth: 2.3, delay: 0.6, kind: 'coin' },
  { left: 12, top: 72, size: 20, depth: 0.9, delay: 2, kind: 'coin' },
  { left: 44, top: 8, size: 16, depth: 0.7, delay: 1.6, kind: 'coin' },
  { left: 22, top: 44, size: 44, depth: 1.9, delay: 0.3, kind: 'bill' },
  { left: 90, top: 84, size: 38, depth: 2.6, delay: 2.4, kind: 'bill' },
  { left: 56, top: 88, size: 22, depth: 1.4, delay: 1, kind: 'coin' },
];

function Float({ item }: { item: FloatItem }) {
  const { x, y } = useDepth(item.depth, 26, 0.12);
  const height = item.kind === 'bill' ? item.size * 0.55 : item.size;
  return (
    <motion.div
      className={`float float--${item.kind}`}
      style={{ left: `${item.left}%`, top: `${item.top}%`, width: item.size, height, x, y }}
    >
      <span
        className="float__bob"
        style={{ animationDelay: `${item.delay}s`, fontSize: item.size * (item.kind === 'bill' ? 0.32 : 0.5) }}
      >
        {item.kind === 'coin' ? '$' : 'R$'}
      </span>
    </motion.div>
  );
}

export function World({ stage, frenzy }: { stage: 'login' | 'game'; frenzy: boolean }) {
  const stars = useDepth(0.2, 30, 0.08);
  const orb = useDepth(0.35, 30, 0.1);
  const far = useDepth(0.55, 30, 0.18);
  const near = useDepth(1, 30, 0.3);

  return (
    <div className={`world world--${stage}`} aria-hidden="true">
      <motion.div
        className="world__zoom"
        initial={false}
        animate={{ scale: stage === 'login' ? 1.14 : 1, y: stage === 'login' ? -24 : 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="world__sky" />
        <motion.div className="world__stars" style={stars}>
          <Stars />
        </motion.div>
        <motion.div className="world__orb" style={orb} />
        <motion.div className="world__city world__city--far" style={far}>
          <Skyline seed={7} minH={200} maxH={500} color="#18205a" windowColor="#fcd34d" density={0.22} beacons />
        </motion.div>
        <motion.div className="world__city world__city--near" style={near}>
          <Skyline seed={3} minH={100} maxH={330} color="#0a0f2c" windowColor="#fbbf24" density={0.3} />
        </motion.div>
        {FLOATS.map((item, i) => (
          <Float key={i} item={item} />
        ))}
      </motion.div>
      <AnimatePresence>
        {frenzy && (
          <motion.div
            className="world__frenzy"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.55, 1, 0.55] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      <div className="world__vignette" />
    </div>
  );
}
