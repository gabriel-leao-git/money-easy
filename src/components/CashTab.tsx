import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { sound, vibrate } from '../fx/sound';
import { MIN_WITHDRAW, RANKS, type Rank } from '../game/config';
import { rankIndex, type GameState } from '../game/state';
import { btc, money, multiplier, when } from '../lib/format';
import { CryptoIcon } from './art';
import { AnimatedMoney, Confetti, Segmented } from './ui';

export type Receipt = { id: number; amount: number; rankUp: Rank | null };

type Share = '25' | '50' | '100';

export function CashTab({ state, onWithdraw }: { state: GameState; onWithdraw: (amount: number) => void }) {
  const [share, setShare] = useState<Share>('100');
  const amount = (state.balance * Number(share)) / 100;
  const can = amount >= MIN_WITHDRAW;
  const ri = rankIndex(state.withdrawn);
  const rank = RANKS[ri];
  const next = RANKS[ri + 1];
  const progress = next ? (state.withdrawn - rank.min) / (next.min - rank.min) : 1;

  return (
    <section className="tab">
      <header className="tab__head">
        <h2>Saque fictício</h2>
        <p>
          Converter o que você minerou e sacar sobe sua patente, e cada patente multiplica toda a mineração. O
          que vai pro Cofre não volta pro saldo, então escolha a hora.
        </p>
      </header>

      <div className="card cash">
        <span className="eyebrow">Disponível</span>
        <AnimatedMoney value={state.balance} className="cash__amount" />
        <span className="play__btc">≈ {btc(state.balance)}</span>
        <Segmented
          id="share"
          label="Quanto sacar"
          value={share}
          onChange={setShare}
          options={[
            { value: '25', label: '25%' },
            { value: '50', label: '50%' },
            { value: '100', label: 'Tudo' },
          ]}
        />
        <div className="cash__line">
          <span>Você vai sacar</span>
          <strong>{money(amount)}</strong>
        </div>
        <motion.button
          type="button"
          className="btn btn--cash btn--block"
          disabled={!can}
          whileTap={{ scale: 0.97 }}
          onClick={() => onWithdraw(amount)}
        >
          Converter e sacar
        </motion.button>
        <p className="cash__note">
          {can ? 'Vai direto pro seu Cofre (fictício).' : `Mínimo de ${money(MIN_WITHDRAW)} para sacar.`}
        </p>
      </div>

      <div className="card rankcard" style={{ '--rank': rank.color } as CSSProperties}>
        <div className="rankcard__top">
          <span className="rankcard__badge" aria-hidden="true">
            {ri + 1}
          </span>
          <span className="rankcard__who">
            <span className="eyebrow">Sua patente</span>
            <strong>{rank.name}</strong>
            <small>Tudo rende {multiplier(rank.mult)}</small>
          </span>
          <span className="rankcard__vault">
            <span className="eyebrow">Cofre</span>
            <strong>{money(state.withdrawn)}</strong>
          </span>
        </div>
        {next ? (
          <>
            <span className="bar bar--lg" style={{ '--accent': next.color } as CSSProperties}>
              <span style={{ transform: `scaleX(${Math.min(1, progress)})` }} />
            </span>
            <p className="rankcard__next">
              Saque mais <strong>{money(next.min - state.withdrawn)}</strong> pra virar{' '}
              <strong style={{ color: next.color }}>{next.name}</strong> ({multiplier(next.mult)})
            </p>
          </>
        ) : (
          <p className="rankcard__next">Patente máxima. Você zerou o Money Easy.</p>
        )}
        <ol className="ladder">
          {RANKS.map((r, i) => (
            <li key={r.name} className={i <= ri ? 'is-on' : undefined} style={{ '--c': r.color } as CSSProperties}>
              <span className="ladder__dot" />
              <span>{r.name}</span>
              <small>{multiplier(r.mult)}</small>
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h3 className="card__title">Histórico</h3>
        {state.history.length ? (
          <ul className="history">
            <AnimatePresence initial={false}>
              {state.history.map((h) => (
                <motion.li
                  key={h.at}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <span>
                    Saque fictício
                    <small>{when(h.at)}</small>
                  </span>
                  <strong>{money(h.amount)}</strong>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        ) : (
          <p className="muted">Nenhum saque ainda. Junte {money(MIN_WITHDRAW)} e faça o primeiro.</p>
        )}
      </div>

      <p className="legal">
        Simulação: nenhuma criptomoeda real é minerada e nenhum dinheiro real é transferido. O Money Easy nunca
        pede chave Pix, CPF, carteira cripto ou dados bancários.
      </p>
    </section>
  );
}

const STEPS = ['Confirmando os blocos…', 'Convertendo cripto em reais…', 'Liberando o saque fictício…'];
const PROCESS_MS = 1750;

export function WithdrawFlow({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  const [phase, setPhase] = useState<'processing' | 'done'>('processing');
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepper = window.setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 580);
    const done = window.setTimeout(() => {
      setPhase('done');
      sound.cash();
      vibrate([12, 50, 24]);
    }, PROCESS_MS);
    return () => {
      window.clearInterval(stepper);
      window.clearTimeout(done);
    };
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phase === 'processing' ? (
        <motion.div key="processing" className="wd" exit={{ opacity: 0, scale: 0.96 }}>
          <motion.div
            className="wd__spinner"
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          >
            <CryptoIcon id="btc" size={84} />
          </motion.div>
          <h3 className="wd__title">Processando saque</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              className="muted"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {STEPS[step]}
            </motion.p>
          </AnimatePresence>
          <span className="bar bar--lg">
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: PROCESS_MS / 1000, ease: 'easeInOut' }}
            />
          </span>
        </motion.div>
      ) : (
        <motion.div
          key="done"
          className="wd"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        >
          {createPortal(<Confetti />, document.body)}
          <svg className="wd__check" viewBox="0 0 64 64" aria-hidden="true">
            <motion.circle
              cx="32"
              cy="32"
              r="29"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
            <motion.path
              d="M19 33l9 9 17-19"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            />
          </svg>
          <span className="eyebrow">Saque fictício concluído</span>
          <strong className="wd__amount">{money(receipt.amount)}</strong>
          <p className="muted">
            foi direto pro seu Cofre. Nenhuma cripto ou dinheiro real foi movimentado: é só o jogo.
          </p>
          {receipt.rankUp && (
            <motion.div
              className="wd__rankup"
              style={{ '--rank': receipt.rankUp.color } as CSSProperties}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 14 }}
            >
              🎖️ Nova patente: <strong>{receipt.rankUp.name}</strong> · tudo rende{' '}
              {multiplier(receipt.rankUp.mult)}
            </motion.div>
          )}
          <button type="button" className="btn btn--primary btn--block" onClick={onClose} autoFocus>
            Voltar a ganhar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
