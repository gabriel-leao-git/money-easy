import { useEffect, useReducer, useRef } from 'react';
import { reducer } from './reducer';
import { loadGame, saveGame } from './state';

const TICK_MS = 100;
const SAVE_MS = 4000;

export function useGame(username: string) {
  const [state, dispatch] = useReducer(reducer, username, loadGame);
  const ref = useRef(state);
  useEffect(() => {
    ref.current = state;
  });

  // Loop do jogo: credita a renda passiva 10x por segundo.
  useEffect(() => {
    let last = performance.now();
    const id = window.setInterval(() => {
      const t = performance.now();
      dispatch({ type: 'tick', dt: (t - last) / 1000, now: Date.now() });
      last = t;
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, []);

  // Salva periodicamente, ao sair da aba e ao desmontar (logout).
  useEffect(() => {
    const persist = () => saveGame(username, ref.current);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') persist();
      else dispatch({ type: 'resume', now: Date.now() });
    };
    const id = window.setInterval(persist, SAVE_MS);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', persist);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', persist);
      persist();
    };
  }, [username]);

  return { state, dispatch, ref };
}
