import { jsx as _jsx } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { TranslationProvider } from './contexts/TranslationProvider';
import { useLocation } from './hooks/useClient';
import Modal from './locations/Modal';
/* ──────────────────────────────
 *  Lazy‑loaded location modules
 * ────────────────────────────── */
const TicketSideBar = lazy(() => import('./locations/TicketSideBar'));
/*  Map <location‑key, ReactComponent> */
const LOCATIONS = {
    ticket_sidebar: TicketSideBar,
    modal: Modal,
    default: () => null
};
/* ──────────────────────────────
 *  Root component
 * ────────────────────────────── */
const App = () => {
    /* `useLocation` puede devolver cualquier string; hacemos cast
       a LocationKey y usamos fallback si no existe en el mapa. */
    const location = useLocation();
    const LocationComponent = LOCATIONS[location] ?? LOCATIONS.default;
    return (_jsx(TranslationProvider, { children: _jsx(Suspense, { fallback: _jsx("span", { children: "Loading\u2026" }), children: _jsx(LocationComponent, {}) }) }));
};
export default App;
