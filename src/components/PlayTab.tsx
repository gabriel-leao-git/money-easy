import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useParallax } from '../fx/parallax';
import { BUSINESSES, COMBO_STEP, MAX_COMBO_MULT, MIN_WITHDRAW, TAP_UPGRADE } from '../game/config';
import {
  businessCost,
  comboMult,
  incomePerSecond,
  isFrenzy,
  isRevealed,
  tapUpgradeCost,
  tapValue,
  type GameState,
} from '../game/state';
import { money, multiplier } from '../lib/format';
import { IconArrow, IconBolt } from './icons';
import type { Tab } from './tabs';
import { AnimatedMoney } from './ui';

export type TapResult = { gain: number; mult: number };

const COMBO_COLORS = ['#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#fb7185', '#f97316', '#facc15'];

type Burst = { id: number; x: number; y: number; text: string; hot: boolean };

function BurstFx({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 38 + Math.random() * 42;
        return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 24, scale: 0.6 + Math.random() * 0.6 };
      }),
    [],
  );
  return (
    <div className="burst" style={{ left: burst.x, top: burst.y }}>
      <motion.span
        className={`burst__text${burst.hot ? ' is-hot' : ''}`}
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: -110, opacity: [0, 1, 1, 0], scale: burst.hot ? 1.3 : 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        onAnimationComplete={() => onDone(burst.id)}
      >
        {burst.text}
      </motion.span>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="burst__coin"
          initial={{ x: 0, y: 0, scale: p.scale, opacity: 1 }}
          animate={{ x: p.dx, y: [0, p.dy, p.dy + 70], opacity: [1, 1, 0], rotate: 200 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

function TapCoin(props: { combo: number; frenzy: boolean; frenzyLeft: number; onTap: () => TapResult }) {
  const { combo, frenzy, frenzyLeft, onTap } = props;
  const areaRef = useRef<HTMLDivElement>(null);
  const seq = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const squash = useSpring(1, { stiffness: 700, damping: 14 });
  const { x, y } = useParallax();
  const rotateY = useTransform(x, (v) => v * 16);
  const rotateX = useTransform(y, (v) => v * -12);
  const shine = useTransform(x, (v) => `${50 + v * 30}%`);

  const mult = comboMult(combo);
  const level = Math.round((mult - 1) / 0.5);
  const progress =
    combo === 0 ? 0 : mult >= MAX_COMBO_MULT ? 1 : (((combo - 1) % COMBO_STEP) + 1) / COMBO_STEP;

  const fire = (clientX?: number, clientY?: number) => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const px = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const py = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const result = onTap();
    squash.jump(0.88);
    squash.set(1);
    const id = ++seq.current;
    setBursts((list) => [
      ...list.slice(-20),
      { id, x: px, y: py, text: `+${money(result.gain)}`, hot: result.mult >= 2 || frenzy },
    ]);
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
  const removeBurst = (id: number) => setBursts((list) => list.filter((b) => b.id !== id));

  return (
    <div className="tap" ref={areaRef} style={{ '--combo': COMBO_COLORS[level] } as CSSProperties}>
      <div className="tap__status">
        <AnimatePresence mode="popLayout" initial={false}>
          {frenzy ? (
            <motion.span
              key="frenzy"
              className="pill pill--frenzy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <IconBolt /> FRENESI x7 · {Math.ceil(frenzyLeft / 1000)}s
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

      <div className={`tap__stage${frenzy ? ' is-frenzy' : ''}`}>
        <svg className="tap__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="tap__ring-track" cx="60" cy="60" r="57" />
          <motion.circle
            className="tap__ring-fill"
            cx="60"
            cy="60"
            r="57"
            initial={false}
            animate={{ pathLength: progress, opacity: progress > 0 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </svg>
        <motion.button
          type="button"
          className="tap__coin"
          style={{ scale: squash, rotateX, rotateY }}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Tocar na moeda para ganhar dinheiro fictício"
        >
          <span className="tap__rim" />
          <span className="tap__face">
            <span className="tap__symbol">R$</span>
          </span>
          <motion.span className="tap__shine" style={{ left: shine }} />
        </motion.button>
      </div>

      {bursts.map((b) => (
        <BurstFx key={b.id} burst={b} onDone={removeBurst} />
      ))}

      <p className="tap__hint">
        {combo > 0 ? 'Não para! O combo multiplica cada toque.' : 'Toque rápido na moeda pra fazer combo'}
      </p>
    </div>
  );
}

type Goal = {
  key: string;
  icon: string;
  title: string;
  detail: string;
  cta: string;
  tab: Tab;
  ready: boolean;
  progress: number;
};

function pickGoal(s: GameState): Goal {
  if (s.withdrawCount === 0) {
    const ready = s.balance >= MIN_WITHDRAW;
    return {
      key: `first-cash-${ready}`,
      icon: '💸',
      title: ready ? 'Primeiro saque liberado!' : `Junte ${money(MIN_WITHDRAW)} pra sacar`,
      detail: ready ? 'Saque (de mentirinha) e suba de patente' : `Faltam ${money(MIN_WITHDRAW - s.balance)}`,
      cta: 'Sacar',
      tab: 'cash',
      ready,
      progress: s.balance / MIN_WITHDRAW,
    };
  }
  const options = [
    { name: TAP_UPGRADE.name, icon: TAP_UPGRADE.emoji, cost: tapUpgradeCost(s.tapLevel) },
    ...BUSINESSES.filter((_, i) => isRevealed(s, i)).map((b) => ({
      name: b.name,
      icon: b.emoji,
      cost: businessCost(b, s.owned[b.id] ?? 0),
    })),
  ];
  const target = options.reduce((best, o) => (o.cost < best.cost ? o : best));
  const ready = s.balance >= target.cost;
  return {
    key: `${target.name}-${ready}`,
    icon: target.icon,
    title: ready ? `Dá pra investir: ${target.name}` : `Próximo: ${target.name}`,
    detail: ready ? `Custa ${money(target.cost)}` : `Faltam ${money(target.cost - s.balance)}`,
    cta: 'Investir',
    tab: 'shop',
    ready,
    progress: s.balance / target.cost,
  };
}

function NextGoal({ state, goTo }: { state: GameState; goTo: (tab: Tab) => void }) {
  const goal = pickGoal(state);
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.button
        key={goal.key}
        type="button"
        className={`goal${goal.ready ? ' is-ready' : ''}`}
        onClick={() => goTo(goal.tab)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="goal__icon" aria-hidden="true">
          {goal.icon}
        </span>
        <span className="goal__body">
          <strong>{goal.title}</strong>
          <small>{goal.detail}</small>
          {!goal.ready && (
            <span className="bar">
              <span style={{ transform: `scaleX(${Math.min(1, goal.progress)})` }} />
            </span>
          )}
        </span>
        <span className="goal__cta">
          {goal.cta} <IconArrow />
        </span>
      </motion.button>
    </AnimatePresence>
  );
}

export function PlayTab(props: { state: GameState; onTap: () => TapResult; goTo: (tab: Tab) => void }) {
  const { state, onTap, goTo } = props;
  const now = state.clock;
  const frenzy = isFrenzy(state, now);

  return (
    <section className="play">
      <div className="play__balance">
        <span className="eyebrow">Saldo fictício</span>
        <AnimatedMoney value={state.balance} className="play__amount" />
        <div className="chips">
          <span className="chip chip--green">+{money(incomePerSecond(state, now))}/s</span>
          <span className="chip">{money(tapValue(state, now))} por toque</span>
        </div>
      </div>
      <TapCoin
        combo={state.combo}
        frenzy={frenzy}
        frenzyLeft={state.frenzyUntil - now}
        onTap={onTap}
      />
      <NextGoal state={state} goTo={goTo} />
    </section>
  );
}
