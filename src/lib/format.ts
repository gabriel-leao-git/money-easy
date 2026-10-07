import { BTC_PRICE, HASH_PER_REAL } from '../game/config';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 2,
});
const integer = new Intl.NumberFormat('pt-BR');
const dateTime = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

/** R$ 1.234,56 até 1 milhão; depois R$ 1,2 mi / R$ 3,4 bi / R$ 5 tri. */
export function money(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  return Math.abs(v) >= 1e6 ? brlCompact.format(v) : brl.format(v);
}

/** Equivalente em BTC pela cotação fictícia do jogo. */
export function btc(value: number): string {
  const coins = (Number.isFinite(value) ? value : 0) / BTC_PRICE;
  const digits = coins >= 1 ? 4 : 8;
  return `${coins.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })} BTC`;
}

const HASH_UNITS = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s', 'ZH/s'];

/** Hashrate "de vitrine" derivado da renda por segundo. */
export function hashrate(incomePerSecond: number): string {
  let h = Math.max(0, incomePerSecond) * HASH_PER_REAL;
  let unit = 0;
  while (h >= 1000 && unit < HASH_UNITS.length - 1) {
    h /= 1000;
    unit += 1;
  }
  return `${h.toLocaleString('pt-BR', { maximumFractionDigits: h < 10 ? 2 : 1 })} ${HASH_UNITS[unit]}`;
}

export function count(value: number): string {
  return integer.format(Math.floor(value));
}

export function multiplier(value: number): string {
  return `x${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}`;
}

export function duration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h}h ${m % 60}min` : `${h}h`;
}

export function when(timestamp: number): string {
  return dateTime.format(timestamp);
}
