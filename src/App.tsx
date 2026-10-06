import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useCallback, useState } from 'react';
import { GameScreen } from './components/Game';
import { LoginScreen } from './components/Login';
import { World } from './components/World';
import { ParallaxProvider } from './fx/parallax';
import { getSession, setSession, upsertProfile } from './game/profiles';

export default function App() {
  const [user, setUser] = useState<string | null>(() => getSession());
  const [frenzy, setFrenzy] = useState(false);

  const login = useCallback((name: string) => {
    const profile = upsertProfile(name);
    setSession(profile.name);
    setUser(profile.name);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    setUser(null);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <ParallaxProvider>
        <World stage={user ? 'game' : 'login'} frenzy={frenzy} />
        <AnimatePresence mode="wait">
          {user ? (
            <GameScreen key={`game:${user}`} username={user} onLogout={logout} onFrenzyChange={setFrenzy} />
          ) : (
            <LoginScreen key="login" onLogin={login} />
          )}
        </AnimatePresence>
      </ParallaxProvider>
    </MotionConfig>
  );
}
