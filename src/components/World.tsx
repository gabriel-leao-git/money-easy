import { AnimatePresence, motion } from 'framer-motion';
import type { CryptoId } from '../game/config';
import { useDepth } from '../fx/parallax';
import { CryptoIcon } from './art';

// Cenário em camadas: a foto de fundo (public/bg-mining.jpg), brilhos neon, uma grade de
// "data center" em perspectiva, moedas cripto voando e partículas subindo.
// Cada camada se mexe numa velocidade diferente (inclinação, mouse e scroll) = parallax.
// Sem a foto, o degradê neon de base aparece no lugar.

const PHOTO_URL = `${import.meta.env.BASE_URL}bg-mining.jpg`;

type FloatItem = { left: number; top: number; size: number; depth: number; delay: number; id: CryptoId };

const FLOATS: FloatItem[] = [
  { left: 6, top: 20, size: 30, depth: 1.5, delay: 0, id: 'btc' },
  { left: 86, top: 34, size: 26, depth: 1.1, delay: 1.2, id: 'eth' },
  { left: 78, top: 66, size: 40, depth: 2.3, delay: 0.6, id: 'btc' },
  { left: 10, top: 76, size: 24, depth: 0.9, delay: 2, id: 'ltc' },
  { left: 44, top: 12, size: 18, depth: 0.7, delay: 1.6, id: 'sol' },
  { left: 18, top: 48, size: 34, depth: 1.9, delay: 0.3, id: 'doge' },
  { left: 90, top: 86, size: 30, depth: 2.6, delay: 2.4, id: 'ada' },
  { left: 56, top: 90, size: 22, depth: 1.4, delay: 1, id: 'eth' },
];

function Float({ item }: { item: FloatItem }) {
  const { x, y } = useDepth(item.depth, 26, 0.12);
  return (
    <motion.div
      className="float"
      style={{ left: `${item.left}%`, top: `${item.top}%`, width: item.size, height: item.size, x, y }}
    >
      <span className="float__bob" style={{ animationDelay: `${item.delay}s` }}>
        <CryptoIcon id={item.id} size={item.size} />
      </span>
    </motion.div>
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 5.9 + 2) % 100,
  delay: -((i * 1.31) % 8),
  duration: 7 + (i % 5) * 1.5,
  size: 2 + (i % 3),
  tone: i % 2,
}));

export function World({ stage, frenzy }: { stage: 'login' | 'game'; frenzy: boolean }) {
  const photo = useDepth(0.35, 22, 0.06);
  const glow = useDepth(0.6, 30, 0.12);
  const grid = useDepth(0.9, 24, 0.2);

  return (
    <div className={`world world--${stage}`} aria-hidden="true">
      <motion.div
        className="world__zoom"
        initial={false}
        animate={{ scale: stage === 'login' ? 1.1 : 1, y: stage === 'login' ? -16 : 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="world__base" />
        <motion.div className="world__photo" style={{ ...photo, backgroundImage: `url("${PHOTO_URL}")` }} />
        <div className="world__shade" />
        <motion.div className="world__glow" style={glow}>
          <span className="world__blob world__blob--cyan" />
          <span className="world__blob world__blob--magenta" />
        </motion.div>
        <motion.div className="world__grid" style={grid}>
          <div className="world__grid-plane" />
        </motion.div>
        {FLOATS.map((item, i) => (
          <Float key={i} item={item} />
        ))}
      </motion.div>
      <div className="world__particles">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className={`particle particle--${p.tone}`}
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
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
