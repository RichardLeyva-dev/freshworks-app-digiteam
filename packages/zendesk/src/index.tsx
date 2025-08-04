import React, { useLayoutEffect, useState, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import '../../freshservice/src/i18n'; 
import AppLoadingView from '../../freshservice/src/components/AppLoadingView';
import LoadErrorView from '../../freshservice/src/components/LoadErrorView';
import AppRoutes from '../../freshservice/src/utils/routes';
import { PlatformProvider } from '../../freshservice/src/context/PlatformContext';
import { ZendeskPlatformService } from './services/ZendeskPlatformAdapter';
import { PrimeReactProvider } from 'primereact/api';
import { HashRouter } from 'react-router-dom';
import { t } from 'i18next';

import '../../freshservice/src/App.css';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';


declare global {
  interface Window {
    app?: {
      initialized: () => Promise<any>;
    };
  }
}

const ZendeskApp = () => {
  const [child, setChild] = useState<ReactNode>(<AppLoadingView />);

 useLayoutEffect(() => {
  console.log("⏳ Inicializando app...");

  const platformService = new ZendeskPlatformService(); 
  console.log("🔧 Creado ZendeskPlatformService");

  platformService.resize();
  platformService.getDigiteamApiUrl$().subscribe({
    next: (backendUrl) => {
      if (!backendUrl) {
        setChild(
          <PrimeReactProvider>
            <LoadErrorView message={t('loadError.urlConfig')} />
          </PrimeReactProvider>
        );
        return;
      }

      setChild(
        <PlatformProvider platformService={platformService}>
          <HashRouter>
            <PrimeReactProvider>
              <div className="p-3 space-y-4">
                <AppRoutes />
              </div>
            </PrimeReactProvider>
          </HashRouter>
        </PlatformProvider>
      );
    },
    error: (err) => {
      console.error('❌ Error al obtener backendUrl:', err);
      setChild(
        <PrimeReactProvider>
          <LoadErrorView message={t('loadError.urlConfig')} />
        </PrimeReactProvider>
      );
    }
  });
}, []);


  return <div>{child}</div>;
};

const root = document.getElementById('root');
if (!root) throw new Error('❌ No se encontró el elemento root');

console.log("🚀 Renderizando aplicación React");
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ZendeskApp />
  </React.StrictMode>
);
