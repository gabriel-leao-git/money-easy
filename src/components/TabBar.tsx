import { motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { IconCash, IconDownload, IconGpu, IconServer, IconTrophy } from './icons';
import type { Tab } from './tabs';

// O dev e o preview servem o APK direto da raiz do repo (ver vite.config.ts).
const APK_URL = `${import.meta.env.BASE_URL}instal-app.apk`;

const TABS: { id: Tab; label: string; Icon: ComponentType }[] = [
  { id: 'play', label: 'Minerar', Icon: IconServer },
  { id: 'shop', label: 'Rigs', Icon: IconGpu },
  { id: 'cash', label: 'Saque', Icon: IconCash },
  { id: 'rank', label: 'Ranking', Icon: IconTrophy },
];

type Props = {
  tab: Tab;
  onChange: (tab: Tab) => void;
  badges: Partial<Record<Tab, boolean>>;
  onDownload: () => void;
};

export function TabBar({ tab, onChange, badges, onDownload }: Props) {
  return (
    <motion.nav
      className="tabbar"
      aria-label="Navegação do jogo"
      initial={{ y: 110 }}
      animate={{ y: 0 }}
      exit={{ y: 110 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30, delay: 0.15 }}
    >
      <div className="tabbar__inner">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === tab;
          return (
            <button
              key={id}
              type="button"
              className={`tabbar__btn${active ? ' is-active' : ''}`}
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="tabbar__pill"
                  transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                />
              )}
              <motion.span
                className="tabbar__icon"
                animate={{ y: active ? -2 : 0, scale: active ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 24 }}
              >
                <Icon />
              </motion.span>
              <span>{label}</span>
              {badges[id] && !active && <span className="tabbar__dot" aria-label="novidade" />}
            </button>
          );
        })}
        <a
          className="tabbar__btn tabbar__btn--download"
          href={APK_URL}
          download
          onClick={onDownload}
          title="Baixar o app (APK para Android)"
        >
          <span className="tabbar__icon">
            <IconDownload />
          </span>
          <span>Download</span>
        </a>
      </div>
    </motion.nav>
  );
}
