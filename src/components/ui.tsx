import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { money } from '../lib/format';

/**
 * Número que "corre" até o valor novo em vez de pular. Só anima saltos grandes
 * (compra, saque, bônus): na renda contínua a mola ficaria sempre atrasada.
 */
export function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const spring = useSpring(value, { stiffness: 130, damping: 22, mass: 0.6 });
  useEffect(() => {
    const current = spring.get();
    const delta = value - current;
    if (delta < 0 || delta > Math.abs(current) * 0.05 + 50) spring.set(value);
    else spring.jump(value);
  }, [spring, value]);
  const text = useTransform(spring, (v) => money(Math.max(0, v)));
  return <motion.span className={className}>{text}</motion.span>;
}

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => Array.from(part)[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      className="avatar"
      style={{ '--c': color, width: size, height: size, fontSize: size * 0.4 } as CSSProperties}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

type Option<T extends string> = { value: T; label: string };

export function Segmented<T extends string>(props: {
  id: string;
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  const { id, label, value, options, onChange } = props;
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            className={on ? 'is-on' : undefined}
            onClick={() => onChange(o.value)}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="seg__pill"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Bottom sheet no celular (arrasta pra baixo pra fechar), modal centralizado no desktop. */
export function Sheet(props: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  const { open, onClose, label, children } = props;
  // Mantém o conteúdo durante a animação de saída.
  const frozen = useRef(children);
  if (open) frozen.current = children;
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sheet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="sheet__backdrop" onClick={() => closeRef.current()} />
          <motion.div
            className="sheet__panel"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) closeRef.current();
            }}
          >
            <span className="sheet__grabber" aria-hidden="true" />
            {open ? children : frozen.current}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type ToastItem = { id: number; icon: string; title: string; body?: string };

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const push = useCallback((toast: Omit<ToastItem, 'id'>) => {
    const id = ++seq.current;
    setToasts((list) => [...list.slice(-2), { ...toast, id }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3400);
  }, []);
  return { toasts, push };
}

export function Toasts({ items }: { items: ToastItem[] }) {
  return (
    <div className="toasts" aria-live="polite">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            className="toast"
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <span className="toast__icon" aria-hidden="true">
              {t.icon}
            </span>
            <span className="toast__text">
              <strong>{t.title}</strong>
              {t.body && <small>{t.body}</small>}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

const CONFETTI_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#a78bfa', '#fde68a'];

/** Explosão de confete feita só com Framer Motion. Renderize com uma `key` nova para disparar de novo. */
export function Confetti({ count = 48 }: { count?: number }) {
  const pieces = useMemo(() => {
    const spread = Math.min(window.innerWidth, 560) * 1.1;
    return Array.from({ length: count }, (_, i) => {
      const w = 6 + Math.random() * 6;
      const round = Math.random() < 0.3;
      return {
        id: i,
        x: (Math.random() - 0.5) * spread,
        peak: -(160 + Math.random() * 260),
        fall: 280 + Math.random() * 340,
        rotate: (Math.random() - 0.5) * 900,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w,
        h: round ? w : w * 1.8,
        round,
        delay: Math.random() * 0.12,
        duration: 1.5 + Math.random() * 0.8,
      };
    });
  }, [count]);

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          style={{ background: p.color, width: p.w, height: p.h, borderRadius: p.round ? '50%' : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: p.x, y: [0, p.peak, p.peak + p.fall], rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{
            delay: p.delay,
            x: { duration: p.duration, ease: 'easeOut' },
            rotate: { duration: p.duration, ease: 'easeOut' },
            y: { duration: p.duration, times: [0, 0.32, 1], ease: ['easeOut', 'easeIn'] },
            opacity: { duration: p.duration, times: [0, 0.75, 1] },
          }}
        />
      ))}
    </div>
  );
}
