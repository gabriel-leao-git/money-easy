import { BUSINESSES, COMBO_WINDOW_MS, FRENZY_MS, MIN_WITHDRAW } from './config';
import {
  applyAway,
  businessCost,
  computeTap,
  freshState,
  goldenBag,
  incomePerSecond,
  tapUpgradeCost,
  type GameState,
} from './state';

export type Action =
  | { type: 'tick'; dt: number; now: number }
  | { type: 'tap'; now: number }
  | { type: 'buy'; id: string; qty: number }
  | { type: 'upgradeTap' }
  | { type: 'withdraw'; amount: number; now: number }
  | { type: 'golden'; kind: 'frenzy' | 'bag'; now: number }
  | { type: 'unlock'; ids: string[] }
  | { type: 'resume'; now: number }
  | { type: 'collectOffline' }
  | { type: 'reset'; now: number };

const earn = (s: GameState, amount: number) => ({
  balance: s.balance + amount,
  lifetime: s.lifetime + amount,
});

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'tick': {
      const dt = Math.min(Math.max(a.dt, 0), 1);
      return {
        ...s,
        ...earn(s, incomePerSecond(s, a.now) * dt),
        clock: a.now,
        lastSeen: a.now,
        playSeconds: s.playSeconds + dt,
        combo: a.now - s.lastTapAt <= COMBO_WINDOW_MS ? s.combo : 0,
      };
    }
    case 'tap': {
      const { combo, mult, gain } = computeTap(s, a.now);
      return {
        ...s,
        ...earn(s, gain),
        clock: a.now,
        taps: s.taps + 1,
        combo,
        lastTapAt: a.now,
        bestCombo: Math.max(s.bestCombo, mult),
      };
    }
    case 'buy': {
      const b = BUSINESSES.find((x) => x.id === a.id);
      if (!b || a.qty < 1) return s;
      const owned = s.owned[b.id] ?? 0;
      const cost = businessCost(b, owned, a.qty);
      if (cost > s.balance) return s;
      return { ...s, balance: s.balance - cost, owned: { ...s.owned, [b.id]: owned + a.qty } };
    }
    case 'upgradeTap': {
      const cost = tapUpgradeCost(s.tapLevel);
      if (cost > s.balance) return s;
      return { ...s, balance: s.balance - cost, tapLevel: s.tapLevel + 1 };
    }
    case 'withdraw': {
      const amount = Math.min(a.amount, s.balance);
      if (amount < MIN_WITHDRAW) return s;
      return {
        ...s,
        balance: s.balance - amount,
        withdrawn: s.withdrawn + amount,
        withdrawCount: s.withdrawCount + 1,
        history: [{ amount, at: a.now }, ...s.history].slice(0, 20),
      };
    }
    case 'golden': {
      if (a.kind === 'frenzy') {
        return { ...s, frenzyUntil: a.now + FRENZY_MS, goldenCaught: s.goldenCaught + 1 };
      }
      return { ...s, ...earn(s, goldenBag(s, a.now)), goldenCaught: s.goldenCaught + 1 };
    }
    case 'unlock': {
      const fresh = a.ids.filter((id) => !s.achievements.includes(id));
      return fresh.length ? { ...s, achievements: [...s.achievements, ...fresh] } : s;
    }
    case 'resume':
      return applyAway(s, a.now);
    case 'collectOffline':
      return s.offlineGain > 0
        ? { ...s, ...earn(s, s.offlineGain), offlineGain: 0, offlineSeconds: 0 }
        : s;
    case 'reset':
      return freshState(a.now);
  }
}
