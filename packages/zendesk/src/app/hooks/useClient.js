import { useContext, useState, useEffect } from 'react';
import { ClientContext } from '../contexts/ClientProvider';
/* ──────────────────────────────
 *  Hook: current ZAFClient
 * ────────────────────────────── */
export const useClient = () => {
    const ctx = useContext(ClientContext);
    if (!ctx) {
        throw new Error('useClient must be used within a ClientProvider');
    }
    return ctx;
};
/* ──────────────────────────────
 *  Hook: current location (ticket_sidebar, modal…)
 * ────────────────────────────── */
export const useLocation = () => {
    const client = useClient();
    const [location, setLocation] = useState(null);
    useEffect(() => {
        client.context().then((data) => {
            setLocation(data.location);
        });
    }, [client]);
    return location;
};
