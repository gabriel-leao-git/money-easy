import { motion, type Variants } from 'framer-motion';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { BASE_TAP, CORE_LEVELS, CRYPTOS, MINERS, OVERCLOCK, type Crypto, type Miner } from '../game/config';
import {
  coreLevel,
  hasCrypto,
  incomePerSecond,
  isRevealed,
  maxAffordable,
  minerCost,
  overclockCost,
  permanentMult,
  tapValue,
  totalOwned,
  type GameState,
} from '../game/state';
import { hashrate, money, multiplier } from '../lib/format';
import { CryptoIcon, HardwareIcon, OverclockIcon } from './art';
import { Segmented } from './ui';

type QtyMode = '1' | '10' | 'max';

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 26 } },
};

function Progress({ value }: { value: number }) {
  return (
    <span className="bar">
      <span style={{ transform: `scaleX(${Math.min(1, Math.max(0, value))})` }} />
    </span>
  );
}

function BuyButton(props: { label: string; cost: number; disabled: boolean; onClick: () => void }) {
  const { label, cost, disabled, onClick } = props;
  return (
    <motion.button type="button" className="buy" disabled={disabled} whileTap={{ scale: 0.92 }} onClick={onClick}>
      <small>{label}</small>
      <strong>{money(cost)}</strong>
    </motion.button>
  );
}

function Tile({ popKey, count, children }: { popKey: number; count?: number; children: ReactNode }) {
  return (
    <motion.span
      key={popKey}
      className="row__tile"
      initial={{ scale: popKey ? 1.3 : 1, rotate: popKey ? -10 : 0 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
    >
      {children}
      {count !== undefined && count > 0 && <span className="row__count">{count}</span>}
    </motion.span>
  );
}

function MinerRow(props: {
  m: Miner;
  state: GameState;
  qtyMode: QtyMode;
  revealed: boolean;
  onBuy: (id: string, qty: number) => void;
}) {
  const { m, state, qtyMode, revealed, onBuy } = props;
  const owned = state.owned[m.id] ?? 0;

  if (!revealed) {
    return (
      <motion.li className="row row--locked" variants={item}>
        <span className="row__tile">?</span>
        <span className="row__body">
          <strong className="row__name">Equipamento bloqueado</strong>
          <span className="row__tagline">Minere {money(m.baseCost * 0.5)} no total para revelar</span>
        </span>
      </motion.li>
    );
  }

  const qty = qtyMode === 'max' ? Math.max(1, maxAffordable(m, owned, state.balance)) : Number(qtyMode);
  const cost = minerCost(m, owned, qty);
  const ready = state.balance >= cost;
  const each = m.income * permanentMult(state);

  return (
    <motion.li className={`row${ready ? ' is-ready' : ''}`} variants={item} style={{ '--accent': m.color } as CSSProperties}>
      <Tile popKey={owned} count={owned}>
        <HardwareIcon kind={m.kind} color={m.color} />
      </Tile>
      <span className="row__body">
        <strong className="row__name">{m.name}</strong>
        <span className="row__meta">
          ⚡ {hashrate(each)} · +{money(each)}/s
        </span>
        <span className="row__tagline">{m.tagline}</span>
        {!ready && <Progress value={state.balance / cost} />}
      </span>
      <BuyButton label={qty > 1 ? `Comprar x${qty}` : 'Comprar'} cost={cost} disabled={!ready} onClick={() => onBuy(m.id, qty)} />
    </motion.li>
  );
}

function CryptoRow({ c, state, onBuy }: { c: Crypto; state: GameState; onBuy: (id: string) => void }) {
  const owned = hasCrypto(state, c.id);
  const ready = !owned && state.balance >= c.cost;
  return (
    <motion.li
      className={`row${owned ? ' is-owned' : ready ? ' is-ready' : ''}`}
      variants={item}
      style={{ '--accent': owned ? '#34d399' : '#f7931a' } as CSSProperties}
    >
      <Tile popKey={owned ? 1 : 0}>
        <CryptoIcon id={c.id} />
      </Tile>
      <span className="row__body">
        <strong className="row__name">
          {c.name} <span className="row__ticker">{c.ticker}</span>
        </strong>
        <span className="row__meta">
          {c.mult > 1 ? `${multiplier(c.mult)} em toda a mineração` : 'Moeda base da mineração'}
        </span>
        <span className="row__tagline">{c.tagline}</span>
        {!owned && !ready && <Progress value={state.balance / c.cost} />}
      </span>
      {owned ? (
        <span className="owned-badge">Minerando ✓</span>
      ) : (
        <BuyButton label="Liberar" cost={c.cost} disabled={!ready} onClick={() => onBuy(c.id)} />
      )}
    </motion.li>
  );
}

export function ShopTab(props: {
  state: GameState;
  onBuy: (id: string, qty: number) => void;
  onUpgradeTap: () => void;
  onBuyCrypto: (id: string) => void;
}) {
  const { state, onBuy, onUpgradeTap, onBuyCrypto } = props;
  const [qtyMode, setQtyMode] = useState<QtyMode>('1');
  const now = state.clock;
  const ips = incomePerSecond(state, now);
  const ocCost = overclockCost(state.tapLevel);
  const ocReady = state.balance >= ocCost;
  const level = coreLevel(state);
  const next = CORE_LEVELS[level + 1];

  return (
    <section className="tab">
      <header className="tab__head">
        <h2>Rigs e GPUs</h2>
        <p>
          Cada equipamento minera sozinho, até com o app fechado. Hashrate:{' '}
          <strong className="text-cyan">{hashrate(ips)}</strong> · <strong className="text-green">{money(ips)}/s</strong>
        </p>
        <p className="tab__sub">
          Núcleo {CORE_LEVELS[level].name}
          {next
            ? ` · com ${next.minMiners} equipamentos ele vira ${next.name} (você tem ${totalOwned(state)})`
            : ' · forma final'}
        </p>
      </header>

      <Segmented
        id="qty"
        label="Quantidade por compra"
        value={qtyMode}
        onChange={setQtyMode}
        options={[
          { value: '1', label: 'x1' },
          { value: '10', label: 'x10' },
          { value: 'max', label: 'Máx' },
        ]}
      />

      <motion.ul className="list" variants={list} initial="hidden" animate="show">
        <motion.li
          className={`row${ocReady ? ' is-ready' : ''}`}
          variants={item}
          style={{ '--accent': OVERCLOCK.color } as CSSProperties}
        >
          <Tile popKey={state.tapLevel} count={state.tapLevel}>
            <OverclockIcon />
          </Tile>
          <span className="row__body">
            <strong className="row__name">{OVERCLOCK.name}</strong>
            <span className="row__meta">Agora: {money(tapValue(state, now))} por clique</span>
            <span className="row__tagline">+{money(BASE_TAP * permanentMult(state))}/clique por nível</span>
            {!ocReady && <Progress value={state.balance / ocCost} />}
          </span>
          <BuyButton label="Comprar" cost={ocCost} disabled={!ocReady} onClick={onUpgradeTap} />
        </motion.li>

        {MINERS.map((m, i) => (
          <MinerRow key={m.id} m={m} state={state} qtyMode={qtyMode} revealed={isRevealed(state, i)} onBuy={onBuy} />
        ))}
      </motion.ul>

      <header className="tab__head">
        <h2>Criptomoedas</h2>
        <p>Cada moeda que você libera multiplica toda a mineração, e os multiplicadores se acumulam. Compra única.</p>
      </header>

      <motion.ul className="list" variants={list} initial="hidden" animate="show">
        {CRYPTOS.map((c) => (
          <CryptoRow key={c.id} c={c} state={state} onBuy={onBuyCrypto} />
        ))}
      </motion.ul>
    </section>
  );
}
