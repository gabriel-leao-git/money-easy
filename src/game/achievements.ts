import { COIN_TIERS, MAX_COMBO_MULT, RANKS } from './config';
import { coinTier, totalOwned, type GameState } from './state';

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (s: GameState) => boolean;
};

const trader = RANKS.find((r) => r.name === 'Trader')!;

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first-tap', icon: '⛏️', title: 'Primeiro hash', desc: 'Minere na mão pela primeira vez', check: (s) => s.taps >= 1 },
  { id: 'taps-100', icon: '👆', title: 'Dedo minerador', desc: 'Faça 100 cliques na moeda', check: (s) => s.taps >= 100 },
  { id: 'taps-1000', icon: '🔥', title: 'Hash na unha', desc: 'Faça 1.000 cliques na moeda', check: (s) => s.taps >= 1000 },
  { id: 'combo-max', icon: '⚡', title: 'Overclock humano', desc: `Chegue ao combo x${MAX_COMBO_MULT}`, check: (s) => s.bestCombo >= MAX_COMBO_MULT },
  { id: 'first-biz', icon: '🖥️', title: 'Primeira GPU', desc: 'Compre seu primeiro equipamento', check: (s) => totalOwned(s) >= 1 },
  { id: 'biz-50', icon: '🏭', title: 'Fazendeiro de hash', desc: 'Tenha 50 equipamentos', check: (s) => totalOwned(s) >= 50 },
  { id: 'core-max', icon: '💎', title: 'Moeda de diamante', desc: 'Evolua a moeda até o nível Diamante', check: (s) => coinTier(s) >= COIN_TIERS.length - 1 },
  { id: 'first-crypto', icon: '🔀', title: 'Diversificou', desc: 'Libere sua primeira altcoin', check: (s) => s.cryptos.length >= 1 },
  { id: 'first-cash', icon: '💸', title: 'Saque de mentirinha', desc: 'Faça o primeiro saque fictício', check: (s) => s.withdrawCount >= 1 },
  { id: 'golden', icon: '🧱', title: 'Bloco raro', desc: 'Pegue um bloco dourado', check: (s) => s.goldenCaught >= 1 },
  { id: 'million', icon: '💰', title: 'Primeiro milhão', desc: 'Minere R$ 1 milhão no total', check: (s) => s.lifetime >= 1e6 },
  { id: 'trader', icon: '📈', title: 'Patente Trader', desc: 'Chegue à patente Trader', check: (s) => s.withdrawn >= trader.min },
  { id: 'billion', icon: '🏆', title: 'Bilhão minerado', desc: 'Minere R$ 1 bilhão no total', check: (s) => s.lifetime >= 1e9 },
  { id: 'quantum', icon: '⚛️', title: 'Salto quântico', desc: 'Compre um data center quântico', check: (s) => (s.owned.quantum ?? 0) >= 1 },
];
