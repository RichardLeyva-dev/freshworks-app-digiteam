import {
  createContext,
  useState,
  useEffect,
  useCallback,
  PropsWithChildren,
  JSX
} from 'react';
import I18n from '@/lib/i18n';
import { useClient } from '../hooks/useClient';

/* ──────────────────────────────
 *  Types & Context
 * ────────────────────────────── */
export interface TranslationContextShape {
  /** Int’l helper with `t()` etc. */
  i18n: I18n;
  /** Cambia el locale y recarga traducciones */
  setLocale: (locale: string) => void;
}

export const TranslationContext =
  createContext<TranslationContextShape | null>(null);

/* ──────────────────────────────
 *  Provider
 * ────────────────────────────── */
export function TranslationProvider(
  props: PropsWithChildren<unknown>
): JSX.Element | null {
  const { children } = props;
  const client = useClient();

  const [i18n] = useState(() => new I18n());
  const [locale, setLocale] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  /* carga (o recarga) las traducciones */
  const loadTranslations = useCallback(
    async (desiredLocale?: string) => {
      const { currentUser } = await client.get('currentUser');
      const effectiveLocale = desiredLocale ?? currentUser.locale;

      await i18n.loadTranslations(effectiveLocale);
      setLoading(false);
    },
    [client, i18n]
  );

  /* al montar y cada vez que `locale` cambie */
  useEffect(() => {
    loadTranslations(locale);
  }, [locale, loadTranslations]);

  if (loading) return null;

  return (
    <TranslationContext.Provider value={{ i18n, setLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}
