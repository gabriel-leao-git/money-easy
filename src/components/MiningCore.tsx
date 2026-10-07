import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { useParallax } from '../fx/parallax';
import { COMBO_STEP, CORE_LEVELS, MAX_COMBO_MULT } from '../game/config';
import { comboMult } from '../game/state';
import { money, multiplier } from '../lib/format';
import { IconBolt } from './icons';

// O "servidor de mineração": um sólido geométrico girando em 3D que gera dinheiro sozinho.
// A forma evolui com o nível do núcleo (tetraedro → cubo → octaedro → dodecaedro → icosaedro),
// a velocidade acompanha o hashrate e um clique nele minera na mão (com combo).

type V3 = [number, number, number];

const PHI = (1 + Math.sqrt(5)) / 2;
const SIGNS = [-1, 1];

function normalize(verts: V3[]): V3[] {
  const r = Math.hypot(...verts[0]);
  return verts.map(([x, y, z]) => [x / r, y / r, z / r]);
}

function edgesOf(verts: V3[]): [number, number][] {
  const dist = (a: V3, b: V3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  let min = Infinity;
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) min = Math.min(min, dist(verts[i], verts[j]));
  const edges: [number, number][] = [];
  for (let i = 0; i < verts.length; i++)
    for (let j = i + 1; j < verts.length; j++) if (dist(verts[i], verts[j]) < min * 1.05) edges.push([i, j]);
  return edges;
}

const cube: V3[] = [];
for (const x of SIGNS) for (const y of SIGNS) for (const z of SIGNS) cube.push([x, y, z]);

const dodeca: V3[] = [...cube];
const icosa: V3[] = [];
for (const a of SIGNS)
  for (const b of SIGNS) {
    dodeca.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [a * PHI, 0, b / PHI]);
    icosa.push([0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]);
  }

const SOLIDS = [
  [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]] as V3[],
  cube,
  [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]] as V3[],
  dodeca,
  icosa,
].map((verts) => {
  const v = normalize(verts);
  return { verts: v, edges: edgesOf(v) };
});

const MAX_VERTS = 20;
const VIEW = 200;
const CENTER = VIEW / 2;
const INNER_R = 50;
const SHELL_R = 82;
const CAMERA = 3.2;

type Projected = { x: number; y: number; z: number };

function project(verts: V3[], ax: number, ay: number, radius: number, out: Projected[]) {
  const ca = Math.cos(ax);
  const sa = Math.sin(ax);
  const cb = Math.cos(ay);
  const sb = Math.sin(ay);
  for (let i = 0; i < verts.length; i++) {
    const [x, y, z] = verts[i];
    const x1 = x * cb + z * sb;
    const z1 = -x * sb + z * cb;
    const y2 = y * ca - z1 * sa;
    const z2 = y * sa + z1 * ca;
    const p = CAMERA / (CAMERA + z2);
    out[i] = { x: CENTER + x1 * radius * p, y: CENTER + y2 * radius * p, z: z2 };
  }
}

function edgePaths(edges: [number, number][], pts: Projected[]) {
  let front = '';
  let back = '';
  for (const [a, b] of edges) {
    const seg = `M${pts[a].x.toFixed(1)} ${pts[a].y.toFixed(1)}L${pts[b].x.toFixed(1)} ${pts[b].y.toFixed(1)}`;
    if (pts[a].z + pts[b].z < 0) front += seg;
    else back += seg;
  }
  return { front, back };
}

type Burst = { id: number; x: number; y: number; text: string; kind: 'tap' | 'hot' | 'passive' };

function BurstFx({ burst, onDone }: { burst: Burst; onDone: (id: number) => void }) {
  const particles = useMemo(
    () =>
      burst.kind === 'passive'
        ? []
        : Array.from({ length: 6 }, (_, i) => {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.6;
            const dist = 38 + Math.random() * 42;
            return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 24, scale: 0.6 + Math.random() * 0.6 };
          }),
    [burst.kind],
  );
  const rise = burst.kind === 'passive' ? -70 : -110;
  return (
    <div className="burst" style={{ left: burst.x, top: burst.y }}>
      <motion.span
        className={`burst__text is-${burst.kind}`}
        initial={{ y: 0, opacity: 0, scale: 0.6 }}
        animate={{ y: rise, opacity: [0, 1, 1, 0], scale: burst.kind === 'hot' ? 1.3 : 1 }}
        transition={{ duration: burst.kind === 'passive' ? 1.3 : 0.9, ease: 'easeOut' }}
        onAnimationComplete={() => onDone(burst.id)}
      >
        {burst.text}
      </motion.span>
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="burst__bit"
          initial={{ x: 0, y: 0, scale: p.scale, opacity: 1 }}
          animate={{ x: p.dx, y: [0, p.dy, p.dy + 70], opacity: [1, 1, 0], rotate: 200 }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

const COMBO_COLORS = ['#22d3ee', '#34d399', '#a3e635', '#facc15', '#f7931a', '#fb7185', '#e879f9', '#a78bfa', '#ffffff'];

type Props = {
  level: number;
  income: number; // R$/s atual
  combo: number;
  frenzy: boolean;
  frenzyLeft: number;
  caption: string;
  onTap: () => { gain: number; mult: number };
};

export function MiningCore({ level, income, combo, frenzy, frenzyLeft, caption, onTap }: Props) {
  const reduce = useReducedMotion();
  const areaRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const backRef = useRef<SVGPathElement>(null);
  const shellRef = useRef<SVGPathElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const angle = useRef({ x: 0.5, y: 0 });
  const pts = useRef<Projected[]>([]);
  const shellPts = useRef<Projected[]>([]);
  const seq = useRef(0);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const solid = SOLIDS[level];
  const shell = SOLIDS[(level + 2) % SOLIDS.length];

  // Gira mais rápido quanto maior o hashrate; o frenesi dobra.
  const speed = Math.min(3.2, 0.35 + 0.32 * Math.log10(1 + income)) * (frenzy ? 2 : 1);
  const speedRef = useRef(speed);
  const tapBoost = useRef(0);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useAnimationFrame((_, delta) => {
    const dt = Math.min(delta, 64) / 1000;
    const boost = tapBoost.current;
    tapBoost.current = boost * Math.pow(0.02, dt);
    const s = reduce ? 0.08 : speedRef.current + boost;
    angle.current.y += s * dt;
    angle.current.x += s * dt * 0.37;

    project(solid.verts, angle.current.x, angle.current.y, INNER_R, pts.current);
    const inner = edgePaths(solid.edges, pts.current);
    frontRef.current?.setAttribute('d', inner.front);
    backRef.current?.setAttribute('d', inner.back);

    project(shell.verts, -angle.current.x * 0.6, -angle.current.y * 0.5, SHELL_R, shellPts.current);
    const outer = edgePaths(shell.edges, shellPts.current);
    shellRef.current?.setAttribute('d', outer.front + outer.back);

    for (let i = 0; i < MAX_VERTS; i++) {
      const dot = dotRefs.current[i];
      if (!dot) continue;
      const p = pts.current[i];
      if (i < solid.verts.length && p) {
        dot.setAttribute('cx', p.x.toFixed(1));
        dot.setAttribute('cy', p.y.toFixed(1));
        dot.setAttribute('r', p.z < 0 ? '3.2' : '2');
      } else {
        dot.setAttribute('r', '0');
      }
    }
  });

  const addBurst = (burst: Omit<Burst, 'id'>) => {
    const id = ++seq.current;
    setBursts((list) => [...list.slice(-20), { ...burst, id }]);
  };
  const removeBurst = (id: number) => setBursts((list) => list.filter((b) => b.id !== id));

  // A cada segundo o servidor "entrega" o que minerou: um +R$ sobe do núcleo.
  const incomeRef = useRef(income);
  useEffect(() => {
    incomeRef.current = income;
  }, [income]);
  useEffect(() => {
    const id = window.setInterval(() => {
      const area = areaRef.current;
      if (!area || incomeRef.current <= 0) return;
      const w = area.clientWidth;
      const h = area.clientHeight;
      const spread = Math.min(w, 300) * 0.32;
      addBurst({
        x: w / 2 + (Math.random() - 0.5) * spread * 2,
        y: h * 0.42 + (Math.random() - 0.5) * spread,
        text: `+${money(incomeRef.current)}`,
        kind: 'passive',
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const squash = useSpring(1, { stiffness: 700, damping: 14 });
  const { x, y } = useParallax();
  const rotateY = useTransform(x, (v) => v * 14);
  const rotateX = useTransform(y, (v) => v * -10);

  const fire = (clientX?: number, clientY?: number) => {
    const area = areaRef.current;
    if (!area) return;
    const rect = area.getBoundingClientRect();
    const px = clientX === undefined ? rect.width / 2 : clientX - rect.left;
    const py = clientY === undefined ? rect.height / 2 : clientY - rect.top;
    const result = onTap();
    squash.jump(0.88);
    squash.set(1);
    tapBoost.current = Math.min(tapBoost.current + 1.6, 8);
    addBurst({ x: px, y: py, text: `+${money(result.gain)}`, kind: result.mult >= 2 || frenzy ? 'hot' : 'tap' });
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fire(e.clientX, e.clientY);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (!e.repeat) fire();
  };

  const mult = comboMult(combo);
  const comboLevel = Math.round((mult - 1) / 0.5);
  const progress =
    combo === 0 ? 0 : mult >= MAX_COMBO_MULT ? 1 : (((combo - 1) % COMBO_STEP) + 1) / COMBO_STEP;

  return (
    <div className="core" ref={areaRef} style={{ '--combo': COMBO_COLORS[comboLevel] } as CSSProperties}>
      <div className="core__status">
        <AnimatePresence mode="popLayout" initial={false}>
          {frenzy ? (
            <motion.span
              key="frenzy"
              className="pill pill--frenzy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <IconBolt /> PUMP x7 · {Math.ceil(frenzyLeft / 1000)}s
            </motion.span>
          ) : combo > 1 ? (
            <motion.span
              key={`combo-${mult}`}
              className="pill pill--combo"
              initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 1.4, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              Combo {multiplier(mult)}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={`core__stage${frenzy ? ' is-frenzy' : ''}`}>
        <svg className="core__ring" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="core__plate" cx="60" cy="60" r="59" />
          <circle className="core__ring-track" cx="60" cy="60" r="57" />
          <motion.circle
            className="core__ring-fill"
            cx="60"
            cy="60"
            r="57"
            initial={false}
            animate={{ pathLength: progress, opacity: progress > 0 ? 1 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </svg>
        <span className="core__orbit core__orbit--a" aria-hidden="true" />
        <span className="core__orbit core__orbit--b" aria-hidden="true" />
        <motion.button
          type="button"
          className="core__btn"
          style={{ scale: squash, rotateX, rotateY }}
          onPointerDown={onPointerDown}
          onKeyDown={onKeyDown}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Núcleo do servidor de mineração. Toque para minerar na mão"
        >
          <motion.svg
            key={level}
            className="core__svg"
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            initial={{ scale: 0.3, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 160, damping: 14 }}
            aria-hidden="true"
          >
            <path ref={shellRef} className="core__shell" />
            <path ref={backRef} className="core__back" />
            <path ref={frontRef} className="core__front" />
            {Array.from({ length: MAX_VERTS }, (_, i) => (
              <circle
                key={i}
                ref={(el) => {
                  dotRefs.current[i] = el;
                }}
                className="core__vertex"
                r="0"
              />
            ))}
          </motion.svg>
        </motion.button>
      </div>

      {bursts.map((b) => (
        <BurstFx key={b.id} burst={b} onDone={removeBurst} />
      ))}

      <p className="core__caption">
        <span className={`core__led${income > 0 ? ' is-on' : ''}`} />
        {caption} · Núcleo {CORE_LEVELS[level].name}
      </p>
    </div>
  );
}
