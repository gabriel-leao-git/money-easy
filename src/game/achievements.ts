import { MAX_COMBO_MULT, RANKS } from './config';
import { totalOwned, type GameState } from './state';

export type Achievement = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  check: (s: GameState) => boolean;
};

const investor = RANKS.find((r) => r.name === 'Investidor')!;

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first-tap', icon: '🪙', title: 'Primeiro real', desc: 'Toque na moeda pela primeira vez', check: (s) => s.taps >= 1 },
  { id: 'taps-100', icon: '👆', title: 'Dedo aquecido', desc: 'Faça 100 toques', check: (s) => s.taps >= 100 },
  { id: 'taps-1000', icon: '🔥', title: 'Tendinite de rico', desc: 'Faça 1.000 toques', check: (s) => s.taps >= 1000 },
  { id: 'combo-max', icon: '⚡', title: 'Combo insano', desc: `Chegue ao combo x${MAX_COMBO_MULT}`, check: (s) => s.bestCombo >= MAX_COMBO_MULT },
  { id: 'first-biz', icon: '🏪', title: 'CNPJ na mão', desc: 'Compre seu primeiro negócio', check: (s) => totalOwned(s) >= 1 },
  { id: 'biz-50', icon: '🏙️', title: 'Conglomerado', desc: 'Tenha 50 negócios', check: (s) => totalOwned(s) >= 50 },
  { id: 'first-cash', icon: '💸', title: 'Saque de mentirinha', desc: 'Faça o primeiro saque fictício', check: (s) => s.withdrawCount >= 1 },
  { id: 'golden', icon: '✨', title: 'Mão de ouro', desc: 'Pegue uma moeda dourada', check: (s) => s.goldenCaught >= 1 },
  { id: 'million', icon: '💰', title: 'Primeiro milhão', desc: 'Ganhe R$ 1 milhão no total', check: (s) => s.lifetime >= 1e6 },
  { id: 'investor', icon: '📈', title: 'Patente Investidor', desc: 'Chegue à patente Investidor', check: (s) => s.withdrawn >= investor.min },
  { id: 'billion', icon: '🏆', title: 'Bilhão no bolso', desc: 'Ganhe R$ 1 bilhão no total', check: (s) => s.lifetime >= 1e9 },
  { id: 'rocket', icon: '🚀', title: 'Rumo à Lua', desc: 'Compre uma empresa de foguetes', check: (s) => (s.owned.foguete ?? 0) >= 1 },
];
