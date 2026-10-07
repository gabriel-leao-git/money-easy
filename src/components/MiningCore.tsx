import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useParallax } from '../fx/parallax';
import { COIN_TIERS, COMBO_STEP, MAX_COMBO_MULT, type CryptoId } from '../game/config';
import { comboMult } from '../game/state';
import { money, multiplier } from '../lib/format';
import { CryptoIcon } from './art';
import { IconBolt } from './icons';

// O "servidor de mineração": uma moeda 3D girando no centro da tela que gera dinheiro sozinha.
// A cada meia volta a face que some troca pela próxima cripto liberada (Bitcoin, Litecoin, Ethereum...).
// A borda muda de material com os equipamentos (bronze → prata → ouro → platina → diamante),
// a velocidade acompanha o hashrate e um clique nela minera na mão (com combo).

const EDGE_LAYERS = 12; // discos empilhados que formam a espessura da moeda
const EDGE_GAP = 1.2; // px entre um disco e o seguinte
const HALF_THICK = ((EDGE_LAYERS - 1) * EDGE_GAP) / 2;
const EDGES = Array.from({ length: EDGE_LAYERS }, (_, i) => i * EDGE_GAP - HALF_THICK);
const FACE_Z = HALF_THICK + 0.5;
const TURN = Math.PI * 2;

type Burst = { id: number; x: number; y: number; text: string; kind: 'tap' | 'hot' | 'passive' };

function BurstFx({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
  const particles = useMemo(
    () =>
      burst.kind === 'passive'
        ? []
        : Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
            const dist = 38 + Math.random() * 42;
            return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 24, scale: 0.6 + Math.random() * 0.6 };
          }),
    [burst.kind],
  );
  const rise = burst.kind === 'passive' ? -70 : -110;
  return (
    <div className="burst" style={{ left: burst.x, top: burst.y }}>
      <motion.span
        className={`burst__text is-${burst.kind}`}
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: rise, opacity: [0, 1, 1, 0], scale: burst.kind === 'hot' ? 1.3 : 1 }}
        transition={{ duration: burst.kind === 'passive' ? 1.3 : 0.9, ease: 'easeOut' }}
        onAnimationComplete={() => onDone(burst.id)}
      >
        {burst.text}
      </motion.span>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="burst__bit"
          initial={{ x: 0, y: 0, scale: p.scale, opacity: 1 }}
          animate={{ x: p.dx, y: [0, p.dy, p.dy + 70], opacity: [1, 1, 0], rotate: 200 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

const COMBO_COLORS = ['#22d3ee', '#34d399', '#a3e635', '#facc15', '#f7931a', '#fb7185', '#e879f9', '#a78bfa', '#ffffff'];

type Props = {
  tier: number;
  coins: CryptoId[]; // criptos liberadas, na ordem em que aparecem nas faces
  income: number; // R$/s atual
  combo: number;
  frenzy: boolean;
  frenzyLeft: number;
  caption: string;
  onTap: () => { gain: number; mult: number };
};

export function MiningCore({ tier, coins, income, combo, frenzy, frenzyLeft, caption, onTap }: Props) {
  const reduce = useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const angle = useRef(0);
  const halfRef = useRef(0);
  const [half, setHalf] = useState(0); // quantas meias voltas a moeda já deu
  const seq = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);

  // Gira mais rápido quanto maior o hashrate; o frenesi dobra.
  const speed = Math.min(3.2, 0.35 + 0.32 * Math.log10(1 + income)) * (frenzy ? 2 : 1);
  const speedRef = useRef(speed);
  const tapBoost = useRef(0);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 64) / 1000;
    const boost = tapBoost.current;
    tapBoost.current = boost * Math.pow(0.02, dt);
    const s = reduce ? 0.08 : speedRef.current + boost;
    angle.current += s * dt;
    const a = angle.current;

    bodyRef.current?.style.setProperty('transform', `rotateY(${(a % TURN).toFixed(4)}rad)`);
    // Escurece a face quando ela fica de lado, pra dar volume.
    const shade = ((1 - Math.abs(Math.cos(a))) * 0.6).toFixed(3);
    for (const el of shadeRefs.current) el?.style.setProperty('opacity', shade);

    const h = Math.floor((a + Math.PI / 2) / Math.PI);
    if (h !== halfRef.current) {
      halfRef.current = h;
      setHalf(h);
    }
  });

  // A face visível fica parada; a escondida já mostra a próxima moeda da fila.
  const pick = (i: number) => coins[i % Math.max(coins.length, 1)] ?? 'btc';
  const front = pick(half % 2 === 0 ? half : half + 1);
  const back = pick(half % 2 === 1 ? half : half + 1);

  const addBurst = (burst: Omit<Burst, 'id'>) => {
    const id = ++seq.current;
    setBursts((list) => [...list.slice(-20), { ...burst, id }]);
  };
  const removeBurst = (id: number) => setBursts((list) => list.filter((b) => b.id !== id));

  // A cada segundo o servidor "entrega" o que minerou: um +R$ sobe da moeda.
  const incomeRef = useRef(income);
  useEffect(() => {
    incomeRef.current = income;
  }, [income]);
  useEffect(() => {
    const id = window.setInterval(() => {
      const area = areaRef.current;
      if (!area || incomeRef.current <= 0) return;
      const w = area.clientWidth;
      const h = area.clientHeight;
      const spread = Math.min(w, 300) * 0.32;
      addBurst({
        x: w / 2 + (Math.random() - 0.5) * spread * 2,
        y: h * 0.42 + (Math.random() - 0.5) * spread,
        text: `+${money(incomeRef.current)}`,
        kind: 'passive',
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const squash = useSpring(1, { stiffness: 700, damping: 14 });
  const { x, y } = useParallax();
  const rotateY = useTransform(x, (v) => v * 14);
  const rotateX = useTransform(y, (v) => v * -10);

  const fire = (clientX?: number, clientY?: number) => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const px = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const py = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const result = onTap();
    squash.jump(0.88);
    squash.set(1);
    tapBoost.current = Math.min(tapBoost.current + 1.6, 8);
    addBurst({ x: px, y: py, text: `+${money(result.gain)}`, kind: result.mult >= 2 || frenzy ? 'hot' : 'tap' });
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fire(e.clientX, e.clientY);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!e.repeat) fire();
  };

  const mult = comboMult(combo);
  const comboLevel = Math.round((mult - 1) / 0.5);
  const progress =
    combo === 0 ? 0 : mult >= MAX_COMBO_MULT ? 1 : (((combo - 1) % COMBO_STEP) + 1) / COMBO_STEP;

  const faces: { id: CryptoId; transform: string }[] = [
    { id: front, transform: `translateZ(${FACE_Z}px)` },
    { id: back, transform: `rotateY(180deg) translateZ(${FACE_Z}px)` },
  ];

  return (
    <div className="core" ref={areaRef} style={{ '--combo': COMBO_COLORS[comboLevel] } as CSSProperties}>
      <div className="core__status">
        <AnimatePresence mode="popLayout" initial={false}>
          {frenzy ? (
            <motion.span
              key="frenzy"
              className="pill pill--frenzy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <IconBolt /> PUMP x7 · {Math.ceil(frenzyLeft / 1000)}s
            </motion.span>
          ) : combo > 1 ? (
            <motion.span
              key={`combo-${mult}`}
              className="pill pill--combo"
              initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              Combo {multiplier(mult)}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={`core__stage${frenzy ? ' is-frenzy' : ''}`}>
        <svg className="core__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="core__plate" cx="60" cy="60" r="59" />
          <circle className="core__ring-track" cx="60" cy="60" r="57" />
          <motion.circle
            className="core__ring-fill"
            cx="60"
            cy="60"
            r="57"
            initial={false}
            animate={{ pathLength: progress, opacity: progress > 0 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </svg>
        <span className="core__orbit core__orbit--a" aria-hidden="true" />
        <span className="core__orbit core__orbit--b" aria-hidden="true" />
        <motion.button
          type="button"
          className="core__btn"
          style={{ scale: squash, rotateX, rotateY }}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Moeda de mineração. Toque para minerar na mão"
        >
          {/* Sem opacity nem filter na moeda: os dois achatam o 3D. */}
          <motion.div
            key={tier}
            className={`coin coin--t${tier}`}
            initial={{ scale: 0.3, rotate: -120 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            aria-hidden="true"
          >
            <div className="coin__body" ref={bodyRef}>
              {EDGES.map((z) => (
                <span key={z} className="coin__edge" style={{ transform: `translateZ(${z}px)` }} />
              ))}
              {faces.map((face, i) => (
                <span key={i} className="coin__face" style={{ transform: face.transform }}>
                  <CryptoIcon id={face.id} size={120} />
                  <span
                    className="coin__shade"
                    ref={(el) => {
                      shadeRefs.current[i] = el;
                    }}
                  />
                </span>
              ))}
            </div>
          </motion.div>
        </motion.button>
      </div>

      {bursts.map((b) => (
        <BurstFx key={b.id} burst={b} onDone={removeBurst} />
      ))}

      <p className="core__caption">
        <span className={`core__led${income > 0 ? ' is-on' : ''}`} />
        {caption} · Moeda {COIN_TIERS[tier].name}
      </p>
    </div>
  );
}
