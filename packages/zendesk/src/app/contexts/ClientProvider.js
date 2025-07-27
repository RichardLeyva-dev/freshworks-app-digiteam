import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState, useEffect, createContext } from 'react';
/* ──────────────────────────────
 *  Context
 * ────────────────────────────── */
export const ClientContext = createContext(null);
/* ──────────────────────────────
 *  Provider
 * ────────────────────────────── */
export const ClientProvider = ({ children }) => {
    /* crea una sola instancia del SDK */
    const client = useMemo(() => window.ZAFClient.init(), []);
    const [appRegistered, setAppRegistered] = useState(false);
    useEffect(() => {
        /* Zendesk emite 'app.registered' cuando el iframe está listo */
        const handler = () => setAppRegistered(true);
        client.on('app.registered', handler);
        return () => {
            /* limpia el listener si el componente se desmonta */
            client.off?.('app.registered', handler);
        };
    }, [client]);
    if (!appRegistered)
        return null;
    return (_jsx(ClientContext.Provider, { value: client, children: children }));
};
