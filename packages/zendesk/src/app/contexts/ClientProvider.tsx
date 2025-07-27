import {
  useMemo,
  useState,
  useEffect,
  createContext,
  PropsWithChildren,
  FC
} from 'react';
import type { ZAFClient } from 'zendesk_app_framework_sdk';

/* ──────────────────────────────
 *  Global window typing for ZAF
 * ────────────────────────────── */
declare global {
  interface Window {
    ZAFClient: { init: () => ZAFClient };
  }
}

/* ──────────────────────────────
 *  Context
 * ────────────────────────────── */
export const ClientContext = createContext<ZAFClient | null>(null);

/* ──────────────────────────────
 *  Provider
 * ────────────────────────────── */
export const ClientProvider: FC<PropsWithChildren<unknown>> = ({
  children
}) => {
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

  if (!appRegistered) return null;

  return (
    <ClientContext.Provider value={client}>{children}</ClientContext.Provider>
  );
};
