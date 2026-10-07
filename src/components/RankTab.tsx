import { motion } from 'framer-motion';
import { useMemo, type CSSProperties } from 'react';
import { ACHIEVEMENTS } from '../game/achievements';
import { BOTS } from '../game/config';
import { listProfiles, profileKey } from '../game/profiles';
import { botScore, rankOf, savedLifetime, totalOwned, type GameState } from '../game/state';
import { count, duration, money, multiplier } from '../lib/format';
import { Avatar } from './ui';
import { IconLogout, IconReset } from './icons';

type Entry = { id: string; name: string; score: number; tag: string };

export function RankTab(props: {
  state: GameState;
  username: string;
  onLogout: () => void;
  onReset: () => void;
}) {
  const { state, username, onLogout, onReset } = props;
  const rank = rankOf(state);

  // Outros perfis deste aparelho: lidos uma vez (o save deles não muda enquanto você joga).
  const others = useMemo(
    () =>
      listProfiles()
        .filter((p) => profileKey(p.name) !== profileKey(username))
        .map((p) => ({ name: p.name, score: savedLifetime(p.name) })),
    [username],
  );

  const minutes = Math.max(0, (state.clock - state.createdAt) / 60_000);
  const entries: Entry[] = [
    { id: 'me', name: username, score: state.lifetime, tag: 'Você' },
    ...others.map((o) => ({ id: `p-${o.name}`, name: o.name, score: o.score, tag: 'Neste aparelho' })),
    ...BOTS.map((b) => ({ id: `b-${b.name}`, name: b.name, score: botScore(b, minutes), tag: 'NPC' })),
  ].sort((a, b) => b.score - a.score);

  const stats = [
    { label: 'Total minerado', value: money(state.lifetime) },
    { label: 'Cofre (sacado)', value: money(state.withdrawn) },
    { label: 'Cliques', value: count(state.taps) },
    { label: 'Melhor combo', value: multiplier(state.bestCombo) },
    { label: 'Equipamentos', value: count(totalOwned(state)) },
    { label: 'Blocos raros', value: count(state.goldenCaught) },
    { label: 'Saques', value: count(state.withdrawCount) },
    { label: 'Tempo de jogo', value: duration(state.playSeconds) },
  ];

  const unlocked = new Set(state.achievements);

  return (
    <section className="tab">
      <div className="card profile" style={{ '--rank': rank.color } as CSSProperties}>
        <Avatar name={username} color={rank.color} size={64} />
        <span className="profile__who">
          <strong>{username}</strong>
          <small style={{ color: rank.color }}>
            {rank.name} · tudo rende {multiplier(rank.mult)}
          </small>
        </span>
      </div>

      <div className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <small>{s.label}</small>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card__title">Ranking por total minerado</h3>
        <ol className="board">
          {entries.map((e, i) => (
            <motion.li
              key={e.id}
              layout="position"
              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              className={e.id === 'me' ? 'is-me' : undefined}
            >
              <span className="board__pos">{i + 1}º</span>
              <Avatar name={e.name} color={e.id === 'me' ? rank.color : '#64748b'} size={32} />
              <span className="board__name">
                {e.name}
                <small>{e.tag}</small>
              </span>
              <strong>{money(e.score)}</strong>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h3 className="card__title">
          Conquistas{' '}
          <span className="muted">
            {unlocked.size}/{ACHIEVEMENTS.length}
          </span>
        </h3>
        <ul className="badges">
          {ACHIEVEMENTS.map((a) => {
            const on = unlocked.has(a.id);
            return (
              <li key={a.id} className={on ? 'is-on' : undefined} title={a.desc}>
                <span className="badges__icon" aria-hidden="true">
                  {on ? a.icon : '🔒'}
                </span>
                <strong>{a.title}</strong>
                <small>{a.desc}</small>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="actions">
        <button type="button" className="btn btn--ghost" onClick={onLogout}>
          <IconLogout /> Sair
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--danger"
          onClick={() => {
            if (window.confirm('Zerar todo o progresso deste usuário? Não dá pra desfazer.')) onReset();
          }}
        >
          <IconReset /> Zerar progresso
        </button>
      </div>

      <p className="legal">NPCs são rivais inventados pelo jogo. Perfis reais só aparecem se jogaram neste aparelho.</p>
    </section>
  );
}
