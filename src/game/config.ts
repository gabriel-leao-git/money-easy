// Números do jogo. Tudo aqui é fictício: nenhuma cripto é minerada e nenhum valor é dinheiro real.

export const BASE_TAP = 10; // R$ 10 por clique manual, como no protótipo original
export const MIN_WITHDRAW = 50; // saque mínimo de R$ 50, como no protótipo original

export const COMBO_WINDOW_MS = 700; // cliques mais espaçados que isso zeram o combo
export const COMBO_STEP = 8; // a cada 8 cliques seguidos o combo sobe +0,5
export const MAX_COMBO_MULT = 5;

export const FRENZY_MULT = 7;
export const FRENZY_MS = 15_000;

export const OFFLINE_RATE = 0.5; // com o app fechado a mineração rende metade
export const OFFLINE_CAP_S = 2 * 60 * 60; // e no máximo 2 horas
export const AWAY_MIN_S = 30; // ausências menores que isso não geram relatório

export const COST_GROWTH = 1.15; // cada unidade comprada encarece a próxima em 15%
export const TAP_SHARE_OF_INCOME = 0.05; // o clique também vale 5% da renda por segundo

// Só para exibição: equivalente em BTC e hashrate. Não mexem na economia.
export const BTC_PRICE = 350_000; // cotação fictícia: 1 BTC = R$ 350.000
export const HASH_PER_REAL = 250_000; // R$ 1/s de renda = 250 kH/s

export type HardwareKind = 'gpu1' | 'gpu2' | 'gpu3' | 'rig' | 'asic' | 'container' | 'farm' | 'quantum';

export type Miner = {
  id: string;
  name: string;
  kind: HardwareKind;
  tagline: string;
  baseCost: number;
  income: number; // R$/s por unidade, antes dos multiplicadores
  color: string;
};

export const MINERS: readonly Miner[] = [
  { id: 'gpu-pixel', name: 'GPU Pixel 2GB', kind: 'gpu1', tagline: 'Esquenta mais do que minera', baseCost: 150, income: 4, color: '#22d3ee' },
  { id: 'gpu-turbo', name: 'GPU Turbo 6GB', kind: 'gpu2', tagline: 'Duas ventoinhas e muita fé', baseCost: 1_500, income: 30, color: '#a78bfa' },
  { id: 'gpu-neon', name: 'GPU Neon 12GB', kind: 'gpu3', tagline: 'O RGB aumenta o hashrate (dizem)', baseCost: 15_000, income: 220, color: '#e879f9' },
  { id: 'rig-6x', name: 'Rig 6x GPU', kind: 'rig', tagline: 'Seis placas e uma extensão duvidosa', baseCost: 160_000, income: 1_500, color: '#f7931a' },
  { id: 'asic', name: 'ASIC Hash Pro', kind: 'asic', tagline: 'Feito só pra minerar, barulho incluso', baseCost: 1_800_000, income: 10_000, color: '#34d399' },
  { id: 'container', name: 'Contêiner de mineração', kind: 'container', tagline: 'Um contêiner inteiro de hash', baseCost: 25_000_000, income: 70_000, color: '#60a5fa' },
  { id: 'farm', name: 'Fazenda de mineração', kind: 'farm', tagline: 'Galpão inteiro e conta de luz épica', baseCost: 400_000_000, income: 500_000, color: '#fbbf24' },
  { id: 'quantum', name: 'Data center quântico', kind: 'quantum', tagline: 'Minera o bloco antes de ele existir', baseCost: 7_000_000_000, income: 3_800_000, color: '#f472b6' },
];

export const OVERCLOCK = {
  name: 'Overclock manual',
  baseCost: 100,
  growth: 1.85,
  color: '#f7931a',
} as const;

export type CryptoId = 'btc' | 'ltc' | 'doge' | 'eth' | 'sol' | 'ada';

export type Crypto = {
  id: CryptoId;
  name: string;
  ticker: string;
  tagline: string;
  cost: number; // compra única
  mult: number; // multiplica toda a mineração, acumulando com as outras
};

// Bitcoin já vem liberado. Cada altcoin comprada multiplica tudo o que você minera.
export const CRYPTOS: readonly Crypto[] = [
  { id: 'btc', name: 'Bitcoin', ticker: 'BTC', tagline: 'A original. Você começa minerando ela.', cost: 0, mult: 1 },
  { id: 'ltc', name: 'Litecoin', ticker: 'LTC', tagline: 'A prata do bitcoin', cost: 25_000, mult: 1.5 },
  { id: 'doge', name: 'Dogecoin', ticker: 'DOGE', tagline: 'Nasceu meme, virou multiplicador', cost: 500_000, mult: 2 },
  { id: 'eth', name: 'Ethereum', ticker: 'ETH', tagline: 'Contrato inteligente, hash esperto', cost: 10_000_000, mult: 2 },
  { id: 'sol', name: 'Solana', ticker: 'SOL', tagline: 'Rápida até demais', cost: 250_000_000, mult: 2.5 },
  { id: 'ada', name: 'Cardano', ticker: 'ADA', tagline: 'Devagar e sempre, só que x3', cost: 5_000_000_000, mult: 3 },
];

// A moeda do centro da tela muda de material conforme você junta equipamentos.
export const COIN_TIERS = [
  { name: 'Bronze', minMiners: 0 },
  { name: 'Prata', minMiners: 5 },
  { name: 'Ouro', minMiners: 15 },
  { name: 'Platina', minMiners: 35 },
  { name: 'Diamante', minMiners: 75 },
] as const;

export type Rank = { name: string; min: number; mult: number; color: string };

// Patente sobe com o total sacado (o "Cofre") e multiplica tudo o que você ganha.
export const RANKS: readonly Rank[] = [
  { name: 'Novato', min: 0, mult: 1, color: '#94a3b8' },
  { name: 'Minerador', min: 1_000, mult: 1.2, color: '#22d3ee' },
  { name: 'Hodler', min: 50_000, mult: 1.5, color: '#34d399' },
  { name: 'Trader', min: 1_000_000, mult: 2, color: '#a78bfa' },
  { name: 'Baleia', min: 50_000_000, mult: 3, color: '#e879f9' },
  { name: 'Magnata cripto', min: 2_000_000_000, mult: 5, color: '#f7931a' },
  { name: 'Lenda do blockchain', min: 100_000_000_000, mult: 8, color: '#fbbf24' },
];

// Rivais NPC do ranking: crescem com o tempo desde que o seu perfil foi criado.
export type Bot = { name: string; base: number; growth: number };

export const BOTS: readonly Bot[] = [
  { name: 'Zé Hash', base: 500, growth: 1.5 },
  { name: 'Dona Blockchain', base: 4_000, growth: 1.7 },
  { name: 'Lucrécio Ledger', base: 30_000, growth: 1.9 },
  { name: 'Capitão Halving', base: 250_000, growth: 2.05 },
  { name: 'Madame Wallet', base: 2_000_000, growth: 2.2 },
];
