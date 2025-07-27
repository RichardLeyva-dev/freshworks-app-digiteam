import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useEffect, useCallback } from 'react';
import I18n from '@/lib/i18n';
import { useClient } from '../hooks/useClient';
export const TranslationContext = createContext(null);
/* ──────────────────────────────
 *  Provider
 * ────────────────────────────── */
export function TranslationProvider(props) {
    const { children } = props;
    const client = useClient();
    const [i18n] = useState(() => new I18n());
    const [locale, setLocale] = useState();
    const [loading, setLoading] = useState(true);
    /* carga (o recarga) las traducciones */
    const loadTranslations = useCallback(async (desiredLocale) => {
        const { currentUser } = await client.get('currentUser');
        const effectiveLocale = desiredLocale ?? currentUser.locale;
        await i18n.loadTranslations(effectiveLocale);
        setLoading(false);
    }, [client, i18n]);
    /* al montar y cada vez que `locale` cambie */
    useEffect(() => {
        loadTranslations(locale);
    }, [locale, loadTranslations]);
    if (loading)
        return null;
    return (_jsx(TranslationContext.Provider, { value: { i18n, setLocale }, children: children }));
}
