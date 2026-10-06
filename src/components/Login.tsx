import { motion, useAnimationControls, useTransform, type Variants } from 'framer-motion';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { requestTiltPermission, useParallax } from '../fx/parallax';
import { sound, vibrate } from '../fx/sound';
import { listProfiles } from '../game/profiles';
import { RANKS } from '../game/config';
import { Avatar } from './ui';
import { IconArrow, IconEye, IconEyeOff, IconLock, IconUser } from './icons';

const FEATURES = [
  { icon: '🪙', text: 'Toque e ganhe' },
  { icon: '🏪', text: 'Invista em negócios' },
  { icon: '💸', text: 'Saque fictício' },
];

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
};

function LogoCoin() {
  const { x, y } = useParallax();
  const rotateY = useTransform(x, (v) => v * 32);
  const rotateX = useTransform(y, (v) => v * -26);
  return (
    <div className="logo">
      <motion.div
        className="logo__coin"
        style={{ rotateX, rotateY }}
        initial={{ scale: 0, rotate: -200 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 13, delay: 0.1 }}
      >
        <span>R$</span>
      </motion.div>
    </div>
  );
}

export function LoginScreen({ onLogin }: { onLogin: (name: string) => void }) {
  const profiles = useMemo(() => listProfiles().slice(0, 4), []);
  const [name, setName] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shake = useAnimationControls();
  const passRef = useRef<HTMLInputElement>(null);

  const fail = (message: string) => {
    setError(message);
    vibrate([20, 40, 20]);
    void shake.start({ x: [0, -12, 12, -8, 8, -4, 0], transition: { duration: 0.45 } });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    requestTiltPermission();
    const trimmed = name.trim();
    if (trimmed.length < 2) return fail('Escolha um usuário com pelo menos 2 caracteres.');
    if (!pass) return fail('Digite qualquer senha. No MVP ela não é conferida.');
    setError(null);
    setBusy(true);
    sound.login();
    // A senha não é enviada nem guardada em lugar nenhum.
    window.setTimeout(() => onLogin(trimmed), 650);
  };

  return (
    <motion.main
      className="login"
      exit={{ opacity: 0, y: -40, scale: 0.97, transition: { duration: 0.4, ease: [0.4, 0, 1, 1] } }}
    >
      <motion.div className="login__hero" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise}>
          <LogoCoin />
        </motion.div>
        <motion.h1 className="login__title" variants={rise} aria-label="Money Easy">
          <span aria-hidden="true">Money</span> <span className="login__accent" aria-hidden="true">Easy</span>
        </motion.h1>
        <motion.p className="login__tagline" variants={rise}>
          Toque, invista e saque. Fique rico de mentirinha.
        </motion.p>
        <motion.ul className="login__features" variants={rise}>
          {FEATURES.map((f) => (
            <li key={f.text}>
              <span aria-hidden="true">{f.icon}</span>
              {f.text}
            </li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div
        className="login__card-wrap"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24, delay: 0.5 }}
      >
        <motion.form className="login__card" onSubmit={submit} animate={shake} noValidate>
          <label className="field">
            <span className="field__label">Usuário</span>
            <span className="field__box">
              <span className="field__icon">
                <IconUser />
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamado?"
                autoComplete="username"
                autoCapitalize="words"
                maxLength={18}
                enterKeyHint="next"
              />
            </span>
          </label>

          <label className="field">
            <span className="field__label">Senha</span>
            <span className="field__box">
              <span className="field__icon">
                <IconLock />
              </span>
              <input
                ref={passRef}
                type={showPass ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="Qualquer senha serve"
                autoComplete="current-password"
                enterKeyHint="go"
              />
              <button
                type="button"
                className="field__toggle"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Esconder senha' : 'Mostrar senha'}
              >
                {showPass ? <IconEyeOff /> : <IconEye />}
              </button>
            </span>
          </label>

          <motion.p
            className="login__error"
            role="alert"
            initial={false}
            animate={{ height: error ? 'auto' : 0, opacity: error ? 1 : 0 }}
          >
            {error}
          </motion.p>

          <motion.button
            type="submit"
            className="btn btn--primary btn--block"
            whileTap={{ scale: 0.97 }}
            disabled={busy}
          >
            {busy ? (
              <>
                <motion.span
                  className="spinner"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                />
                Entrando…
              </>
            ) : (
              <>
                Entrar e jogar <IconArrow />
              </>
            )}
          </motion.button>

          <p className="login__mvp">
            MVP sem autenticação: qualquer usuário e senha entram. A senha não é guardada e o progresso
            fica só neste aparelho.
          </p>
        </motion.form>

        {profiles.length > 0 && (
          <div className="login__profiles">
            <span className="eyebrow">Continuar como</span>
            <div className="login__chips">
              {profiles.map((p) => (
                <motion.button
                  key={p.name}
                  type="button"
                  className="chip-btn"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setName(p.name);
                    setError(null);
                    passRef.current?.focus();
                  }}
                >
                  <Avatar name={p.name} color={RANKS[0].color} size={24} />
                  {p.name}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <p className="legal">Jogo fictício. Nenhum dinheiro real é ganho, sacado ou transferido.</p>
    </motion.main>
  );
}
