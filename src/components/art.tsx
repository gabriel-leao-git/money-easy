import type { CryptoId, HardwareKind } from '../game/config';

// Ícones desenhados para o jogo (SVG próprio): hardware de mineração e criptomoedas.

const BODY = '#120e27';
const METAL = '#c7c3e6';
const FINGERS = '#fbbf24';

function Fan({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0b0818" stroke={color} strokeWidth="1.6" />
      {[0, 120, 240].map((deg) => (
        <path
          key={deg}
          d={`M${cx} ${cy} q ${r * 0.55} ${-r * 0.15} ${r * 0.72} ${-r * 0.72}`}
          stroke={color}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          transform={`rotate(${deg} ${cx} ${cy})`}
        />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.22} fill={color} />
    </g>
  );
}

function Gpu({ fans, color }: { fans: 1 | 2 | 3; color: string }) {
  const width = fans === 1 ? 30 : fans === 2 ? 36 : 40;
  const x = 46 - width;
  const r = fans === 3 ? 5.4 : 6.6;
  const step = width / (fans + 0.6);
  return (
    <>
      <rect x={x - 3} y="12" width="3" height="22" rx="1" fill={METAL} />
      <rect x={x} y="13" width={width} height="18" rx="3" fill={BODY} stroke={color} strokeWidth="1.6" />
      <rect x={x + 2} y="29" width={width - 4} height="2" fill={color} />
      {Array.from({ length: fans }, (_, i) => (
        <Fan key={i} cx={x + step * (i + 0.8)} cy={21.5} r={r} color={color} />
      ))}
      <rect x={x + 5} y="31" width={Math.min(18, width - 10)} height="4" rx="0.8" fill={FINGERS} />
    </>
  );
}

export function HardwareIcon({ kind, color, size = 34 }: { kind: HardwareKind; color: string; size?: number }) {
  let art;
  switch (kind) {
    case 'gpu1':
      art = <Gpu fans={1} color={color} />;
      break;
    case 'gpu2':
      art = <Gpu fans={2} color={color} />;
      break;
    case 'gpu3':
      art = <Gpu fans={3} color={color} />;
      break;
    case 'rig':
      art = (
        <>
          <rect x="5" y="9" width="38" height="30" rx="2" fill="none" stroke={METAL} strokeWidth="1.6" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <rect x={8 + i * 5.6} y="12" width="4.2" height="22" rx="1" fill={BODY} stroke={color} strokeWidth="1.2" />
              <circle cx={10.1 + i * 5.6} cy="18" r="1.3" fill={color} />
            </g>
          ))}
          <rect x="5" y="36" width="38" height="3" fill={METAL} />
        </>
      );
      break;
    case 'asic':
      art = (
        <>
          <rect x="7" y="10" width="34" height="28" rx="3" fill={BODY} stroke={color} strokeWidth="1.6" />
          <circle cx="24" cy="24" r="9" fill="#0b0818" stroke={color} strokeWidth="1.4" />
          <path d="M15 24h18M24 15v18M17.6 17.6l12.8 12.8M30.4 17.6 17.6 30.4" stroke={color} strokeWidth="1" />
          <rect x="10" y="13" width="3" height="22" rx="1" fill={METAL} opacity="0.6" />
          <rect x="35" y="13" width="3" height="22" rx="1" fill={METAL} opacity="0.6" />
          <circle cx="36.5" cy="34.5" r="1.4" fill="#34d399" />
        </>
      );
      break;
    case 'container':
      art = (
        <>
          <rect x="4" y="13" width="40" height="22" rx="1.5" fill={BODY} stroke={color} strokeWidth="1.6" />
          {[10, 15, 20, 25, 30, 35].map((x) => (
            <path key={x} d={`M${x} 16v16`} stroke={color} strokeWidth="1" strokeOpacity="0.55" />
          ))}
          <path d="M24.5 17.5 20 25h4l-1 5.5 5-8h-4l1-5z" fill="#fbbf24" />
          <rect x="4" y="35" width="40" height="2.5" fill={METAL} />
        </>
      );
      break;
    case 'farm':
      art = (
        <>
          {[5, 18.5, 32].map((x) => (
            <g key={x}>
              <rect x={x} y="8" width="11" height="32" rx="1.5" fill={BODY} stroke={color} strokeWidth="1.4" />
              {[12, 17, 22, 27, 32].map((y, i) => (
                <g key={y}>
                  <rect x={x + 2} y={y} width="7" height="2.2" rx="0.6" fill="#2a2058" />
                  <circle cx={x + 8} cy={y + 1.1} r="0.9" fill={i % 2 ? '#34d399' : color} />
                </g>
              ))}
            </g>
          ))}
        </>
      );
      break;
    case 'quantum':
      art = (
        <>
          {[0, 60, 120].map((deg) => (
            <ellipse
              key={deg}
              cx="24"
              cy="24"
              rx="18"
              ry="7"
              fill="none"
              stroke={color}
              strokeWidth="1.6"
              transform={`rotate(${deg} 24 24)`}
            />
          ))}
          <circle cx="24" cy="24" r="5" fill={color} />
          <circle cx="24" cy="24" r="2.2" fill="#fff" />
          <circle cx="42" cy="24" r="1.8" fill="#67e8f9" />
          <circle cx="15" cy="8.4" r="1.8" fill="#67e8f9" />
        </>
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {art}
    </svg>
  );
}

export function OverclockIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="11" y="11" width="26" height="26" rx="4" fill={BODY} stroke="#f7931a" strokeWidth="1.6" />
      {[16, 22, 28, 34].map((p) => (
        <g key={p} stroke={METAL} strokeWidth="1.6" strokeLinecap="round">
          <path d={`M${p - 2} 6v5M${p - 2} 37v5M6 ${p - 2}h5M37 ${p - 2}h5`} />
        </g>
      ))}
      <path d="M26 15 18 26h6l-2 8 9-12h-6l1-7z" fill="#fbbf24" />
    </svg>
  );
}

const CRYPTO_BG: Record<CryptoId, string> = {
  btc: '#f7931a',
  ltc: '#7c8fd6',
  doge: '#d4a72c',
  eth: '#627eea',
  sol: 'url(#sol-grad)',
  ada: '#2563eb',
};

/** Moedas desenhadas no estilo de cada cripto (não são os logos oficiais). */
export function CryptoIcon({ id, size = 34 }: { id: CryptoId; size?: number }) {
  let glyph;
  switch (id) {
    case 'btc':
      glyph = (
        <g transform="rotate(14 12 12)" stroke="#fff" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.6 6.6v10.8M8.6 6.6h4.8a2.6 2.6 0 0 1 0 5.2H8.6M8.6 11.8h5.6a2.8 2.8 0 0 1 0 5.6H8.6" />
          <path d="M10.4 4.8v1.8M13 4.8v1.8M10.4 17.4v1.8M13 17.4v1.8" />
        </g>
      );
      break;
    case 'ltc':
      glyph = (
        <path d="M10.6 6v11h6M7.6 13.4l6.2-2.6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      );
      break;
    case 'doge':
      glyph = (
        <path d="M9.4 6.6h3a5.4 5.4 0 0 1 0 10.8h-3zM7.4 12h6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      );
      break;
    case 'eth':
      glyph = (
        <g fill="#fff">
          <path d="M12 4.4 7.4 12.2 12 15l4.6-2.8z" />
          <path d="M7.4 13.2 12 19.6l4.6-6.4L12 16z" opacity="0.75" />
        </g>
      );
      break;
    case 'sol':
      glyph = (
        <g fill="#fff">
          <path d="M8.6 7.4h8.6l-1.8 1.9H6.8z" />
          <path d="M6.8 11.1h8.6l1.8 1.9H8.6z" />
          <path d="M8.6 14.8h8.6l-1.8 1.9H6.8z" />
        </g>
      );
      break;
    case 'ada':
      glyph = (
        <g fill="#fff">
          <circle cx="12" cy="12" r="2.2" />
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <circle key={deg} cx="12" cy="6.2" r="1.25" transform={`rotate(${deg} 12 12)`} />
          ))}
          {[30, 90, 150, 210, 270, 330].map((deg) => (
            <circle key={deg} cx="12" cy="8.6" r="0.8" transform={`rotate(${deg} 12 12)`} />
          ))}
        </g>
      );
      break;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {id === 'sol' && (
        <defs>
          <linearGradient id="sol-grad" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#9945ff" />
            <stop offset="1" stopColor="#14f195" />
          </linearGradient>
        </defs>
      )}
      <circle cx="12" cy="12" r="11.2" fill={CRYPTO_BG[id]} />
      <circle cx="12" cy="12" r="11.2" fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="0.8" />
      {glyph}
    </svg>
  );
}
