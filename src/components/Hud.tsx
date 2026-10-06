import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { sound } from '../fx/sound';
import type { Rank } from '../game/config';
import { money, multiplier } from '../lib/format';
import { AnimatedMoney, Avatar } from './ui';
import { IconMute, IconSound } from './icons';

type Props = {
  name: string;
  rank: Rank;
  balance: number;
  ips: number;
  showBalance: boolean;
  onProfile: () => void;
};

export function Hud({ name, rank, balance, ips, showBalance, onProfile }: Props) {
  const [muted, setMuted] = useState(sound.isMuted());
  const toggle = () => {
    sound.setMuted(!muted);
    setMuted(!muted);
  };

  return (
    <motion.header
      className="hud"
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.1 }}
    >
      <button type="button" className="hud__profile" onClick={onProfile}>
        <Avatar name={name} color={rank.color} size={38} />
        <span className="hud__who">
          <strong>{name}</strong>
          <small style={{ color: rank.color }}>
            {rank.name} · {multiplier(rank.mult)}
          </small>
        </span>
      </button>
      <div className="hud__right">
        <AnimatePresence initial={false}>
          {showBalance && (
            <motion.div
              key="balance"
              className="hud__balance"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <AnimatedMoney value={balance} />
              <small>+{money(ips)}/s</small>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="icon-btn"
          onClick={toggle}
          aria-label={muted ? 'Ligar som' : 'Desligar som'}
          aria-pressed={!muted}
        >
          {muted ? <IconMute /> : <IconSound />}
        </button>
      </div>
    </motion.header>
  );
}
