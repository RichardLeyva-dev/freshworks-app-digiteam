import { useContext, useState, useEffect } from 'react';

/*  Type taken from the stub we created in zaf-sdk.d.ts  */
import type { ZAFClient } from 'zendesk_app_framework_sdk';
import { ClientContext } from '../contexts/ClientProvider';

/* ──────────────────────────────
 *  Hook: current ZAFClient
 * ────────────────────────────── */
export const useClient = (): ZAFClient => {
  const ctx = useContext(ClientContext);

  if (!ctx) {
    throw new Error('useClient must be used within a ClientProvider');
  }

  return ctx;
};

/* ──────────────────────────────
 *  Hook: current location (ticket_sidebar, modal…)
 * ────────────────────────────── */
export const useLocation = (): string | null => {
  const client = useClient();
  const [location, setLocation] = useState<string | null>(null);

  useEffect(() => {
    client.context().then((data: { location: string }) => {
      setLocation(data.location);
    });
  }, [client]);

  return location;
};
