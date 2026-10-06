import { load, remove, save } from '../lib/storage';

// Login do MVP: sem autenticação. O usuário só identifica qual save carregar
// neste aparelho, e a senha nunca é guardada.
export type Profile = { name: string; createdAt: number; lastLogin: number };

export const profileKey = (name: string) => name.trim().toLowerCase();

function isProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false;
  const p = value as Record<string, unknown>;
  return typeof p.name === 'string' && typeof p.createdAt === 'number' && typeof p.lastLogin === 'number';
}

export function listProfiles(): Profile[] {
  const raw = load<unknown>('profiles', []);
  if (!Array.isArray(raw)) return [];
  return raw.filter(isProfile).sort((a, b) => b.lastLogin - a.lastLogin);
}

export function upsertProfile(name: string): Profile {
  const now = Date.now();
  const key = profileKey(name);
  const list = listProfiles();
  const existing = list.find((p) => profileKey(p.name) === key);
  const profile: Profile = existing
    ? { ...existing, lastLogin: now }
    : { name: name.trim(), createdAt: now, lastLogin: now };
  save('profiles', [profile, ...list.filter((p) => profileKey(p.name) !== key)]);
  return profile;
}

export function getSession(): string | null {
  const value = load<unknown>('session', null);
  return typeof value === 'string' && value.trim() ? value : null;
}

export function setSession(name: string | null) {
  if (name) save('session', name);
  else remove('session');
}
