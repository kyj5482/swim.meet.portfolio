import { createContext, useContext, useState, type ReactNode } from 'react';
import { ko, type TranslationKey } from './ko';
import { en } from './en';

export type Lang = 'ko' | 'en';
const DICTS: Record<Lang, Record<TranslationKey, string>> = { ko, en };
const STORAGE_KEY = 'swimvault.lang';

/** {n} 같은 플레이스홀더를 치환. */
function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

/** Provider 밖(예: 단위 테스트)에서도 동작하는 기본값(한국어). */
const fallback: I18nValue = {
  lang: 'ko',
  setLang: () => {},
  t: (key, vars) => interpolate(ko[key] ?? String(key), vars),
};

const I18nContext = createContext<I18nValue>(fallback);

function detectInitialLang(): Lang {
  const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (saved === 'ko' || saved === 'en') return saved;
  const nav = globalThis.navigator?.language ?? 'ko';
  return nav.startsWith('en') ? 'en' : 'ko';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    globalThis.localStorage?.setItem(STORAGE_KEY, l);
  };

  const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
    interpolate(DICTS[lang][key] ?? DICTS.ko[key] ?? key, vars);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

export type { TranslationKey };
