// Números do jogo. Tudo aqui é fictício: nenhum valor corresponde a dinheiro real.

export const BASE_TAP = 10; // R$ 10 por toque, como no protótipo original
export const MIN_WITHDRAW = 50; // saque mínimo de R$ 50, como no protótipo original

export const COMBO_WINDOW_MS = 700; // toques mais espaçados que isso zeram o combo
export const COMBO_STEP = 8; // a cada 8 toques seguidos o combo sobe +0,5
export const MAX_COMBO_MULT = 5;

export const FRENZY_MULT = 7;
export const FRENZY_MS = 15_000;

export const OFFLINE_RATE = 0.5; // fora do app os negócios rendem metade
export const OFFLINE_CAP_S = 2 * 60 * 60; // e no máximo 2 horas
export const AWAY_MIN_S = 30; // ausências menores que isso não geram relatório

export const COST_GROWTH = 1.15; // cada unidade comprada encarece a próxima em 15%
export const TAP_SHARE_OF_INCOME = 0.05; // o toque também vale 5% da renda por segundo

export type Business = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  baseCost: number;
  income: number; // R$/s por unidade, antes dos multiplicadores
  color: string;
};

export const BUSINESSES: readonly Business[] = [
  { id: 'brigadeiro', name: 'Brigadeiro gourmet', emoji: '🍫', tagline: 'Caixa de isopor na saída da facul', baseCost: 150, income: 4, color: '#f97316' },
  { id: 'lavajato', name: 'Lava-jato', emoji: '🧽', tagline: 'Cera, aspirador e pretinho no pneu', baseCost: 1_500, income: 30, color: '#38bdf8' },
  { id: 'foodtruck', name: 'Food truck', emoji: '🚚', tagline: 'Fila dobrando o quarteirão', baseCost: 15_000, income: 220, color: '#f43f5e' },
  { id: 'hamburgueria', name: 'Hamburgueria artesanal', emoji: '🍔', tagline: 'Pão brioche e 40 minutos de espera', baseCost: 160_000, income: 1_500, color: '#eab308' },
  { id: 'startup', name: 'Startup de IA', emoji: '🤖', tagline: 'Um slide e muita confiança', baseCost: 1_800_000, income: 10_000, color: '#a78bfa' },
  { id: 'banco', name: 'Banco digital', emoji: '🏦', tagline: 'Cartão de metal e app bonitinho', baseCost: 25_000_000, income: 70_000, color: '#10b981' },
  { id: 'petroleo', name: 'Petrolífera', emoji: '🛢️', tagline: 'Achou petróleo no quintal', baseCost: 400_000_000, income: 500_000, color: '#94a3b8' },
  { id: 'foguete', name: 'Empresa de foguetes', emoji: '🚀', tagline: 'Turismo espacial, só ida', baseCost: 7_000_000_000, income: 3_800_000, color: '#fb7185' },
];

export const TAP_UPGRADE = {
  name: 'Dedo de ouro',
  emoji: '👆',
  tagline: '+R$ 10 por toque a cada nível',
  baseCost: 100,
  growth: 1.85,
  color: '#fbbf24',
} as const;

export type Rank = { name: string; min: number; mult: number; color: string };

// Patente sobe com o total sacado (o "Cofre") e multiplica tudo o que você ganha.
export const RANKS: readonly Rank[] = [
  { name: 'Estagiário', min: 0, mult: 1, color: '#94a3b8' },
  { name: 'Freelancer', min: 1_000, mult: 1.2, color: '#38bdf8' },
  { name: 'Empreendedor', min: 50_000, mult: 1.5, color: '#34d399' },
  { name: 'Investidor', min: 1_000_000, mult: 2, color: '#a78bfa' },
  { name: 'Magnata', min: 50_000_000, mult: 3, color: '#f472b6' },
  { name: 'Tubarão', min: 2_000_000_000, mult: 5, color: '#fb923c' },
  { name: 'Bilionário', min: 100_000_000_000, mult: 8, color: '#fbbf24' },
];

// Rivais NPC do ranking: crescem com o tempo desde que o seu perfil foi criado.
export type Bot = { name: string; base: number; growth: number };

export const BOTS: readonly Bot[] = [
  { name: 'Zé Trocado', base: 500, growth: 1.5 },
  { name: 'Dona Cifra', base: 4_000, growth: 1.7 },
  { name: 'Lucrécio', base: 30_000, growth: 1.9 },
  { name: 'Capitão Juros', base: 250_000, growth: 2.05 },
  { name: 'Madame Rendinha', base: 2_000_000, growth: 2.2 },
];
