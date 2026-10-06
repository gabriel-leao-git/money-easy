import { motion, type Variants } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { BASE_TAP, BUSINESSES, TAP_UPGRADE, type Business } from '../game/config';
import {
  businessCost,
  incomePerSecond,
  isRevealed,
  maxAffordable,
  rankOf,
  tapUpgradeCost,
  tapValue,
  type GameState,
} from '../game/state';
import { money } from '../lib/format';
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

function BuyButton(props: { qty: number; cost: number; disabled: boolean; onClick: () => void }) {
  const { qty, cost, disabled, onClick } = props;
  return (
    <motion.button type="button" className="buy" disabled={disabled} whileTap={{ scale: 0.92 }} onClick={onClick}>
      <small>{qty > 1 ? `Comprar x${qty}` : 'Comprar'}</small>
      <strong>{money(cost)}</strong>
    </motion.button>
  );
}

function BusinessRow(props: {
  b: Business;
  state: GameState;
  qtyMode: QtyMode;
  revealed: boolean;
  onBuy: (id: string, qty: number) => void;
}) {
  const { b, state, qtyMode, revealed, onBuy } = props;
  const owned = state.owned[b.id] ?? 0;

  if (!revealed) {
    return (
      <motion.li className="row row--locked" variants={item}>
        <span className="row__tile">?</span>
        <span className="row__body">
          <strong className="row__name">Negócio misterioso</strong>
          <span className="row__tagline">Ganhe {money(b.baseCost * 0.5)} no total para revelar</span>
        </span>
      </motion.li>
    );
  }

  const qty = qtyMode === 'max' ? Math.max(1, maxAffordable(b, owned, state.balance)) : Number(qtyMode);
  const cost = businessCost(b, owned, qty);
  const ready = state.balance >= cost;
  const each = b.income * rankOf(state).mult;

  return (
    <motion.li
      className={`row${ready ? ' is-ready' : ''}`}
      variants={item}
      style={{ '--accent': b.color } as CSSProperties}
    >
      <motion.span
        key={owned}
        className="row__tile"
        initial={{ scale: owned ? 1.3 : 1, rotate: owned ? -10 : 0 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
      >
        <span aria-hidden="true">{b.emoji}</span>
        {owned > 0 && <span className="row__count">{owned}</span>}
      </motion.span>
      <span className="row__body">
        <strong className="row__name">{b.name}</strong>
        <span className="row__meta">
          +{money(each)}/s cada{owned > 0 && <> · rende {money(each * owned)}/s</>}
        </span>
        <span className="row__tagline">{b.tagline}</span>
        {!ready && <Progress value={state.balance / cost} />}
      </span>
      <BuyButton qty={qty} cost={cost} disabled={!ready} onClick={() => onBuy(b.id, qty)} />
    </motion.li>
  );
}

export function ShopTab(props: {
  state: GameState;
  onBuy: (id: string, qty: number) => void;
  onUpgradeTap: () => void;
}) {
  const { state, onBuy, onUpgradeTap } = props;
  const [qtyMode, setQtyMode] = useState<QtyMode>('1');
  const now = state.clock;
  const tapCost = tapUpgradeCost(state.tapLevel);
  const tapReady = state.balance >= tapCost;

  return (
    <section className="tab">
      <header className="tab__head">
        <h2>Negócios</h2>
        <p>
          Cada negócio rende sozinho, até com o app fechado. Rendendo agora:{' '}
          <strong className="text-green">{money(incomePerSecond(state, now))}/s</strong>
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
          className={`row row--upgrade${tapReady ? ' is-ready' : ''}`}
          variants={item}
          style={{ '--accent': TAP_UPGRADE.color } as CSSProperties}
        >
          <motion.span
            key={state.tapLevel}
            className="row__tile"
            initial={{ scale: state.tapLevel ? 1.3 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
          >
            <span aria-hidden="true">{TAP_UPGRADE.emoji}</span>
            <span className="row__count">{state.tapLevel}</span>
          </motion.span>
          <span className="row__body">
            <strong className="row__name">{TAP_UPGRADE.name}</strong>
            <span className="row__meta">Agora: {money(tapValue(state, now))} por toque</span>
            <span className="row__tagline">
              +{money(BASE_TAP * rankOf(state).mult)}/toque por nível
            </span>
            {!tapReady && <Progress value={state.balance / tapCost} />}
          </span>
          <BuyButton qty={1} cost={tapCost} disabled={!tapReady} onClick={onUpgradeTap} />
        </motion.li>

        {BUSINESSES.map((b, i) => (
          <BusinessRow
            key={b.id}
            b={b}
            state={state}
            qtyMode={qtyMode}
            revealed={isRevealed(state, i)}
            onBuy={onBuy}
          />
        ))}
      </motion.ul>
    </section>
  );
}
