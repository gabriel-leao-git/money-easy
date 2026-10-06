import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { sound, vibrate } from '../fx/sound';
import { ACHIEVEMENTS } from '../game/achievements';
import { BUSINESSES, MIN_WITHDRAW, RANKS } from '../game/config';
import {
  businessCost,
  computeTap,
  goldenBag,
  incomePerSecond,
  isFrenzy,
  isRevealed,
  rankIndex,
  rankOf,
  tapUpgradeCost,
} from '../game/state';
import { useGame } from '../game/useGame';
import { duration, money } from '../lib/format';
import { CashTab, WithdrawFlow, type Receipt } from './CashTab';
import { GoldenCoin } from './GoldenCoin';
import { Hud } from './Hud';
import { PlayTab, type TapResult } from './PlayTab';
import { RankTab } from './RankTab';
import { ShopTab } from './ShopTab';
import { TabBar } from './TabBar';
import { TAB_ORDER, type Tab } from './tabs';
import { Sheet, Toasts, useToasts } from './ui';

const tabVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -36 }),
};

type Props = {
  username: string;
  onLogout: () => void;
  onFrenzyChange: (frenzy: boolean) => void;
};

export function GameScreen({ username, onLogout, onFrenzyChange }: Props) {
  const { state, dispatch, ref } = useGame(username);
  const [tab, setTab] = useState<Tab>('play');
  const [dir, setDir] = useState(1);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const { toasts, push } = useToasts();

  const now = state.clock;
  const frenzy = isFrenzy(state, now);
  const rank = rankOf(state);

  useEffect(() => {
    onFrenzyChange(frenzy);
  }, [frenzy, onFrenzyChange]);
  useEffect(() => () => onFrenzyChange(false), [onFrenzyChange]);

  // Conquistas: confere a cada atualização e solta um toast para cada nova.
  useEffect(() => {
    const fresh = ACHIEVEMENTS.filter((a) => !state.achievements.includes(a.id) && a.check(state));
    if (!fresh.length) return;
    dispatch({ type: 'unlock', ids: fresh.map((a) => a.id) });
    fresh.forEach((a) => push({ icon: a.icon, title: `Conquista: ${a.title}`, body: a.desc }));
    sound.achievement();
  }, [state, dispatch, push]);

  const goTo = (next: Tab) => {
    if (next === tab) return;
    setDir(TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(tab) ? 1 : -1);
    setTab(next);
    window.scrollTo(0, 0);
  };

  const handleTap = useCallback((): TapResult => {
    const at = Date.now();
    const preview = computeTap(ref.current, at);
    dispatch({ type: 'tap', now: at });
    sound.coin(preview.mult);
    vibrate(6);
    return preview;
  }, [dispatch, ref]);

  const handleBuy = useCallback(
    (id: string, qty: number) => {
      dispatch({ type: 'buy', id, qty });
      sound.buy();
      vibrate(14);
    },
    [dispatch],
  );

  const handleUpgradeTap = useCallback(() => {
    dispatch({ type: 'upgradeTap' });
    sound.buy();
    vibrate(14);
  }, [dispatch]);

  const handleWithdraw = useCallback(
    (amount: number) => {
      const s = ref.current;
      const value = Math.min(amount, s.balance);
      if (value < MIN_WITHDRAW) return;
      const before = rankIndex(s.withdrawn);
      const after = rankIndex(s.withdrawn + value);
      const at = Date.now();
      dispatch({ type: 'withdraw', amount: value, now: at });
      setReceipt({ id: at, amount: value, rankUp: after > before ? RANKS[after] : null });
      setReceiptOpen(true);
    },
    [dispatch, ref],
  );

  const handleGolden = useCallback(() => {
    const at = Date.now();
    if (Math.random() < 0.45) {
      dispatch({ type: 'golden', kind: 'frenzy', now: at });
      push({ icon: '⚡', title: 'FRENESI! Tudo x7', body: 'Por 15 segundos, toques e negócios rendem 7 vezes mais.' });
    } else {
      const gain = goldenBag(ref.current, at);
      dispatch({ type: 'golden', kind: 'bag', now: at });
      push({ icon: '💰', title: `Bolsa de ouro: +${money(gain)}`, body: 'Moeda dourada capturada.' });
    }
    sound.golden();
    vibrate([10, 30, 10]);
  }, [dispatch, push, ref]);

  const collectOffline = useCallback(() => {
    if (ref.current.offlineGain <= 0) return;
    dispatch({ type: 'collectOffline' });
    sound.cash();
  }, [dispatch, ref]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'reset', now: Date.now() });
    setTab('play');
  }, [dispatch]);

  const canInvest =
    state.balance >= tapUpgradeCost(state.tapLevel) ||
    BUSINESSES.some((b, i) => isRevealed(state, i) && state.balance >= businessCost(b, state.owned[b.id] ?? 0));
  const firstCashReady = state.withdrawCount === 0 && state.balance >= MIN_WITHDRAW;

  return (
    <>
      <motion.div className="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <Hud
          name={username}
          rank={rank}
          balance={state.balance}
          ips={incomePerSecond(state, now)}
          showBalance={tab !== 'play'}
          onProfile={() => goTo('rank')}
        />
        <main className="game__main">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={tab}
              custom={dir}
              variants={tabVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === 'play' && <PlayTab state={state} onTap={handleTap} goTo={goTo} />}
              {tab === 'shop' && <ShopTab state={state} onBuy={handleBuy} onUpgradeTap={handleUpgradeTap} />}
              {tab === 'cash' && <CashTab state={state} onWithdraw={handleWithdraw} />}
              {tab === 'rank' && (
                <RankTab state={state} username={username} onLogout={onLogout} onReset={handleReset} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      <TabBar tab={tab} onChange={goTo} badges={{ shop: canInvest, cash: firstCashReady }} />
      <GoldenCoin onCatch={handleGolden} />
      <Toasts items={toasts} />

      <Sheet open={receiptOpen} onClose={() => setReceiptOpen(false)} label="Saque fictício">
        {receipt && <WithdrawFlow key={receipt.id} receipt={receipt} onClose={() => setReceiptOpen(false)} />}
      </Sheet>

      <Sheet open={state.offlineGain > 0} onClose={collectOffline} label="Rendimento enquanto você estava fora">
        <div className="wd">
          <motion.div
            className="wd__emoji"
            initial={{ y: 24, opacity: 0, scale: 0.6 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 14 }}
            aria-hidden="true"
          >
            💰
          </motion.div>
          <span className="eyebrow">Bem-vindo de volta, {username}</span>
          <strong className="wd__amount">+{money(state.offlineGain)}</strong>
          <p className="muted">
            Você ficou fora por {duration(state.offlineSeconds)} e seus negócios renderam isso (metade do ritmo
            normal, até 2 horas).
          </p>
          <button type="button" className="btn btn--gold btn--block" onClick={collectOffline} autoFocus>
            Coletar
          </button>
        </div>
      </Sheet>
    </>
  );
}
