import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { CRYPTOS, MINERS, MIN_WITHDRAW } from '../game/config';
import {
  coinTier,
  hasCrypto,
  incomePerSecond,
  isFrenzy,
  isRevealed,
  minerCost,
  overclockCost,
  tapValue,
  type GameState,
} from '../game/state';
import { btc, hashrate, money } from '../lib/format';
import { CryptoIcon, HardwareIcon, OverclockIcon } from './art';
import { IconArrow } from './icons';
import { MiningCore } from './MiningCore';
import type { Tab } from './tabs';
import { AnimatedMoney } from './ui';

export type TapResult = { gain: number; mult: number };

type Goal = {
  key: string;
  icon: ReactNode;
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
      icon: <CryptoIcon id="btc" size={28} />,
      title: ready ? 'Primeiro saque liberado!' : `Junte ${money(MIN_WITHDRAW)} pra sacar`,
      detail: ready ? 'Saque (de mentirinha) e suba de patente' : `Faltam ${money(MIN_WITHDRAW - s.balance)}`,
      cta: 'Sacar',
      tab: 'cash',
      ready,
      progress: s.balance / MIN_WITHDRAW,
    };
  }
  const options: { name: string; icon: ReactNode; cost: number }[] = [
    { name: 'Overclock manual', icon: <OverclockIcon size={28} />, cost: overclockCost(s.tapLevel) },
    ...MINERS.filter((_, i) => isRevealed(s, i)).map((m) => ({
      name: m.name,
      icon: <HardwareIcon kind={m.kind} color={m.color} size={28} />,
      cost: minerCost(m, s.owned[m.id] ?? 0),
    })),
    ...CRYPTOS.filter((c) => !hasCrypto(s, c.id)).map((c) => ({
      name: c.name,
      icon: <CryptoIcon id={c.id} size={28} />,
      cost: c.cost,
    })),
  ];
  const target = options.reduce((best, o) => (o.cost < best.cost ? o : best));
  const ready = s.balance >= target.cost;
  return {
    key: `${target.name}-${ready}`,
    icon: target.icon,
    title: ready ? `Dá pra comprar: ${target.name}` : `Próximo: ${target.name}`,
    detail: ready ? `Custa ${money(target.cost)}` : `Faltam ${money(target.cost - s.balance)}`,
    cta: 'Ver',
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
        <span className="goal__icon">{goal.icon}</span>
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
  const ips = incomePerSecond(state, now);
  const caption =
    state.taps === 0 ? 'Toque na moeda para minerar' : ips > 0 ? 'Servidor online' : 'Servidor sem GPU';

  return (
    <section className="play">
      <div className="play__balance">
        <span className="eyebrow">Saldo minerado (fictício)</span>
        <AnimatedMoney value={state.balance} className="play__amount" />
        <span className="play__btc">≈ {btc(state.balance)} · cotação fictícia</span>
        <div className="chips">
          <span className="chip chip--cyan">⚡ {hashrate(ips)}</span>
          <span className="chip chip--green">+{money(ips)}/s</span>
          <span className="chip">{money(tapValue(state, now))}/clique</span>
        </div>
      </div>
      <MiningCore
        tier={coinTier(state)}
        coins={CRYPTOS.filter((c) => hasCrypto(state, c.id)).map((c) => c.id)}
        income={ips}
        combo={state.combo}
        frenzy={isFrenzy(state, now)}
        frenzyLeft={state.frenzyUntil - now}
        caption={caption}
        onTap={onTap}
      />
      <NextGoal state={state} goTo={goTo} />
    </section>
  );
}
