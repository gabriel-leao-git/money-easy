import {
  AWAY_MIN_S,
  BASE_TAP,
  COMBO_STEP,
  COMBO_WINDOW_MS,
  CORE_LEVELS,
  COST_GROWTH,
  CRYPTOS,
  FRENZY_MULT,
  MAX_COMBO_MULT,
  MINERS,
  OFFLINE_CAP_S,
  OFFLINE_RATE,
  OVERCLOCK,
  RANKS,
  TAP_SHARE_OF_INCOME,
  type Bot,
  type Miner,
} from './config';
import { load, save } from '../lib/storage';
import { profileKey } from './profiles';

export type Withdrawal = { amount: number; at: number };

export type GameState = {
  createdAt: number;
  balance: number;
  lifetime: number; // tudo o que já foi minerado
  withdrawn: number; // o Cofre: total sacado, define a patente
  withdrawCount: number;
  history: Withdrawal[];
  taps: number;
  tapLevel: number; // nível do Overclock manual
  owned: Record<string, number>; // equipamentos de mineração
  cryptos: string[]; // altcoins liberadas (o bitcoin vem de graça)
  achievements: string[];
  bestCombo: number;
  goldenCaught: number;
  playSeconds: number;
  lastSeen: number;
  // Transitórios: não vão para o save.
  clock: number;
  combo: number;
  lastTapAt: number;
  frenzyUntil: number;
  offlineGain: number;
  offlineSeconds: number;
};

export function freshState(now: number): GameState {
  return {
    createdAt: now,
    balance: 0,
    lifetime: 0,
    withdrawn: 0,
    withdrawCount: 0,
    history: [],
    taps: 0,
    tapLevel: 0,
    owned: {},
    cryptos: [],
    achievements: [],
    bestCombo: 1,
    goldenCaught: 0,
    playSeconds: 0,
    lastSeen: now,
    clock: now,
    combo: 0,
    lastTapAt: 0,
    frenzyUntil: 0,
    offlineGain: 0,
    offlineSeconds: 0,
  };
}

// ---------- regras derivadas ----------

export const totalOwned = (s: GameState) => Object.values(s.owned).reduce((sum, n) => sum + n, 0);

export function rankIndex(withdrawn: number): number {
  let index = 0;
  RANKS.forEach((rank, i) => {
    if (withdrawn >= rank.min) index = i;
  });
  return index;
}

export const rankOf = (s: GameState) => RANKS[rankIndex(s.withdrawn)];
export const isFrenzy = (s: GameState, now: number) => now < s.frenzyUntil;
export const hasCrypto = (s: GameState, id: string) => id === 'btc' || s.cryptos.includes(id);

export const cryptoMult = (s: GameState) =>
  CRYPTOS.reduce((mult, c) => (hasCrypto(s, c.id) ? mult * c.mult : mult), 1);

export const baseIncome = (s: GameState) =>
  MINERS.reduce((sum, m) => sum + (s.owned[m.id] ?? 0) * m.income, 0);

/** Patente x criptos liberadas, sem o frenesi. */
export const permanentMult = (s: GameState) => rankOf(s).mult * cryptoMult(s);

const globalMult = (s: GameState, now: number) => permanentMult(s) * (isFrenzy(s, now) ? FRENZY_MULT : 1);

export const incomePerSecond = (s: GameState, now: number) => baseIncome(s) * globalMult(s, now);

export const tapValue = (s: GameState, now: number) =>
  (BASE_TAP * (1 + s.tapLevel) + baseIncome(s) * TAP_SHARE_OF_INCOME) * globalMult(s, now);

/** Combo 1–8 → x1, 9–16 → x1,5 … 65+ → x5. */
export const comboMult = (combo: number) =>
  Math.min(MAX_COMBO_MULT, 1 + Math.floor(Math.max(combo - 1, 0) / COMBO_STEP) * 0.5);

export function computeTap(s: GameState, now: number) {
  const combo = now - s.lastTapAt <= COMBO_WINDOW_MS ? s.combo + 1 : 1;
  const mult = comboMult(combo);
  return { combo, mult, gain: tapValue(s, now) * mult };
}

export const goldenBag = (s: GameState, now: number) =>
  Math.max(incomePerSecond(s, now) * 90, tapValue(s, now) * 30);

/** Custo de comprar `qty` unidades a partir de `owned` (soma de PG). */
export function minerCost(m: Miner, owned: number, qty = 1): number {
  const first = m.baseCost * COST_GROWTH ** owned;
  return (first * (COST_GROWTH ** qty - 1)) / (COST_GROWTH - 1);
}

export function maxAffordable(m: Miner, owned: number, balance: number): number {
  const first = m.baseCost * COST_GROWTH ** owned;
  if (balance < first) return 0;
  let qty = Math.floor(Math.log((balance * (COST_GROWTH - 1)) / first + 1) / Math.log(COST_GROWTH));
  while (qty > 0 && minerCost(m, owned, qty) > balance) qty -= 1;
  return qty;
}

export const overclockCost = (level: number) => OVERCLOCK.baseCost * OVERCLOCK.growth ** level;

/** Um equipamento aparece quando o anterior já foi comprado ou você chegou perto do preço dele. */
export function isRevealed(s: GameState, index: number): boolean {
  const m = MINERS[index];
  if (index === 0 || (s.owned[m.id] ?? 0) > 0) return true;
  const prev = MINERS[index - 1];
  return (s.owned[prev.id] ?? 0) > 0 || s.lifetime >= m.baseCost * 0.5;
}

/** Nível do núcleo do servidor (0–4): a forma geométrica no centro da tela. */
export function coreLevel(s: GameState): number {
  const owned = totalOwned(s);
  let level = 0;
  CORE_LEVELS.forEach((l, i) => {
    if (owned >= l.minMiners) level = i;
  });
  return level;
}

export const botScore = (bot: Bot, minutes: number) => bot.base * Math.pow(1 + minutes / 2, bot.growth);

/** Credita o que os rigs mineraram enquanto o jogo estava fechado (vira o relatório de boas-vindas). */
export function applyAway(s: GameState, now: number): GameState {
  const away = (now - s.lastSeen) / 1000;
  const rate = baseIncome(s) * permanentMult(s);
  if (away < AWAY_MIN_S || rate <= 0) return { ...s, lastSeen: now, clock: now };
  return {
    ...s,
    lastSeen: now,
    clock: now,
    offlineGain: s.offlineGain + rate * Math.min(away, OFFLINE_CAP_S) * OFFLINE_RATE,
    offlineSeconds: s.offlineSeconds + away,
  };
}

// ---------- save ----------

const saveKey = (name: string) => `save:${profileKey(name)}`;
const num = (v: unknown, fallback: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : fallback;

export function saveGame(name: string, s: GameState) {
  // Mineração offline ainda não coletada entra no save para não se perder.
  save(saveKey(name), {
    createdAt: s.createdAt,
    balance: s.balance + s.offlineGain,
    lifetime: s.lifetime + s.offlineGain,
    withdrawn: s.withdrawn,
    withdrawCount: s.withdrawCount,
    history: s.history,
    taps: s.taps,
    tapLevel: s.tapLevel,
    owned: s.owned,
    cryptos: s.cryptos,
    achievements: s.achievements,
    bestCombo: s.bestCombo,
    goldenCaught: s.goldenCaught,
    playSeconds: s.playSeconds,
    lastSeen: s.lastSeen,
  });
}

export function loadGame(name: string): GameState {
  const now = Date.now();
  const base = freshState(now);
  const raw = load<Record<string, unknown> | null>(saveKey(name), null);
  if (!raw || typeof raw !== 'object') return base;

  const owned: Record<string, number> = {};
  if (raw.owned && typeof raw.owned === 'object') {
    for (const m of MINERS) {
      const v = (raw.owned as Record<string, unknown>)[m.id];
      if (typeof v === 'number' && Number.isInteger(v) && v > 0) owned[m.id] = v;
    }
  }
  const cryptos = Array.isArray(raw.cryptos)
    ? raw.cryptos.filter((id): id is string => CRYPTOS.some((c) => c.id === id && c.id !== 'btc'))
    : [];
  const history = Array.isArray(raw.history)
    ? raw.history
        .filter((h): h is Withdrawal => !!h && typeof h.amount === 'number' && typeof h.at === 'number')
        .slice(0, 20)
    : [];
  const achievements = Array.isArray(raw.achievements)
    ? raw.achievements.filter((a): a is string => typeof a === 'string')
    : [];

  return applyAway(
    {
      ...base,
      createdAt: num(raw.createdAt, now),
      balance: num(raw.balance, 0),
      lifetime: num(raw.lifetime, 0),
      withdrawn: num(raw.withdrawn, 0),
      withdrawCount: num(raw.withdrawCount, 0),
      history,
      taps: num(raw.taps, 0),
      tapLevel: Math.floor(num(raw.tapLevel, 0)),
      owned,
      cryptos,
      achievements,
      bestCombo: Math.max(1, num(raw.bestCombo, 1)),
      goldenCaught: num(raw.goldenCaught, 0),
      playSeconds: num(raw.playSeconds, 0),
      lastSeen: Math.min(num(raw.lastSeen, now), now),
    },
    now,
  );
}

export function savedLifetime(name: string): number {
  const raw = load<Record<string, unknown> | null>(saveKey(name), null);
  return raw && typeof raw === 'object' ? num(raw.lifetime, 0) : 0;
}
