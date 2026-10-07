import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { CryptoIcon } from './art';

const FLIGHT_MS = 9000;
const MIN_WAIT_MS = 18_000;
const EXTRA_WAIT_MS = 37_000;

type Spawn = { id: number; top: number; fromLeft: boolean };

/** De tempos em tempos um bloco dourado atravessa a tela. Quem pega ganha bônus. */
export function GoldenCoin({ onCatch }: { onCatch: () => void }) {
  const reduce = useReducedMotion();
  const [spawn, setSpawn] = useState<Spawn | null>(null);
  const caught = useRef(false);

  useEffect(() => {
    if (spawn) {
      const t = window.setTimeout(() => setSpawn(null), FLIGHT_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      caught.current = false;
      setSpawn({ id: Date.now(), top: 16 + Math.random() * 46, fromLeft: Math.random() < 0.5 });
    }, MIN_WAIT_MS + Math.random() * EXTRA_WAIT_MS);
    return () => window.clearTimeout(t);
  }, [spawn]);

  const grab = () => {
    if (caught.current) return;
    caught.current = true;
    onCatch();
    setSpawn(null);
  };

  const from = spawn?.fromLeft ? '-25vw' : '110vw';
  const to = spawn?.fromLeft ? '110vw' : '-25vw';

  return (
    <AnimatePresence>
      {spawn && (
        <motion.button
          key={spawn.id}
          type="button"
          className="golden"
          style={{ top: `${spawn.top}%` }}
          initial={reduce ? { opacity: 0, x: '70vw' } : { x: from, rotate: 0 }}
          animate={
            reduce
              ? { opacity: 1, x: '70vw' }
              : { x: to, rotate: spawn.fromLeft ? 540 : -540, y: [0, -28, 0, 28, 0] }
          }
          exit={{ scale: 2.2, opacity: 0, transition: { duration: 0.35 } }}
          transition={{
            x: { duration: FLIGHT_MS / 1000, ease: 'linear' },
            rotate: { duration: FLIGHT_MS / 1000, ease: 'linear' },
            y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          onPointerDown={grab}
          onClick={grab}
          aria-label="Bloco dourado! Toque para pegar o bônus"
        >
          <CryptoIcon id="btc" size={44} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
