import React, { FC, useLayoutEffect, useState, ReactNode } from 'react';
// import 'index.css'; // Tailwind global revisar ese
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { PrimeReactProvider } from 'primereact/api';
import { HashRouter } from 'react-router-dom';
import AppLoadingView from '../../freshservice/src/components/AppLoadingView';
import LoadErrorView from '../../freshservice/src/components/LoadErrorView';
import AppRoutes from '../../freshservice/src/utils/routes';
import { PlatformProvider } from '../../freshservice/src/context/PlatformContext';
import { ZendeskPlatformService } from './services/ZendeskPlatformAdapter';

const App: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    // Aquí podrías inicializar cosas si Zendesk requiere
    setLoading(false);
  }, []);

  if (loading) {
    return <AppLoadingView />;
  }

  if (error) {
    return <LoadErrorView message={error} />;
  }

  return (
    <PlatformProvider platformService={new ZendeskPlatformService()}>

      <PrimeReactProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </PrimeReactProvider>
    </PlatformProvider>
  );
};

export default App;
