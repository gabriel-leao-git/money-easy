// Tudo fica no localStorage deste aparelho. Nada é enviado para servidor nenhum.
const NS = 'money-easy:v1';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${NS}:${key}`);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(`${NS}:${key}`, JSON.stringify(value));
  } catch {
    // aba anônima ou storage bloqueado: o jogo continua só em memória
  }
}

export function remove(key: string) {
  try {
    window.localStorage.removeItem(`${NS}:${key}`);
  } catch {
    // idem
  }
}
