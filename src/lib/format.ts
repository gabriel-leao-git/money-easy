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
