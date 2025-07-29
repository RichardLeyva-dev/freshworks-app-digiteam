import React, { useLayoutEffect, useState, ReactNode, FC } from 'react';
import './App.css';
import './i18n/index.ts';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import { HashRouter } from 'react-router-dom';
import AppLoadingView from './components/AppLoadingView.tsx';
import { FreshservicePlatformService } from './services/FreshservicePlatformAdapter.ts';
import AppRoutes from './utils/routes.tsx';
import { PlatformProvider } from './context/PlatformContext.tsx';
import { t } from 'i18next';
import LoadErrorView from './components/LoadErrorView.tsx';


declare global {
  interface Window {
    app?: {
      initialized: () => Promise<any>;
    };
  }
}

const App: FC = () => {
  const [child, setChild] = useState<ReactNode>(<AppLoadingView />);

  useLayoutEffect(() => {
    const script = document.createElement('script');
    script.src = '{{{appclient}}}';
    script.defer = true;

    script.onload = () => {
      window.app
        ?.initialized()
        .then((client) => {
          const platformService = new FreshservicePlatformService(client);
          platformService.resize();

          platformService.getDigiteamApiUrl$().subscribe({
            next: (backendUrl) => {
              if (!backendUrl) {
                console.error('❌ Backend URL is missing');
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
        })
        .catch((err) => {
          console.error('❌ Error al inicializar la app:', err);
          setChild(
            <PrimeReactProvider>
              <LoadErrorView message={t('loadError.initApp')} />
            </PrimeReactProvider>
          );
        });
    };

    script.onerror = () => {
      setChild(
        <PrimeReactProvider>
          <LoadErrorView message={t('loadError.clientScript')} />
        </PrimeReactProvider>
      );
    };

    if (!document.querySelector(`script[src="{{{appclient}}}"]`)) {
      document.head.appendChild(script);
    }

    return () => {
      const el = document.querySelector(`script[src="{{{appclient}}}"]`);
      if (el) document.head.removeChild(el);
    };
  }, []);

  return <div>{child}</div>;
};

export default App;




// import React, {useLayoutEffect, useState, ReactNode, FC} from 'react';
// import './App.css';
// import './i18n/index.ts';
// import {PrimeReactProvider} from 'primereact/api';
// import 'primereact/resources/themes/lara-light-teal/theme.css';
// import 'primereact/resources/primereact.css';
// import 'primeicons/primeicons.css';
// import {HashRouter} from 'react-router-dom';
// import AppLoadingView from './components/AppLoadingView.tsx';
// import {FreshservicePlatformService} from './services/FreshservicePlatformAdapter.ts';
// import AppRoutes from './utils/routes.tsx';
// import {PlatformProvider} from './context/PlatformContext.tsx';
// import {t} from 'i18next';
// import LoadErrorView from './components/LoadErrorView.tsx';

// declare global {
//     interface Window {
//         app?: {
//             initialized: () => Promise<any>;
//         };
//     }
// }
// const App: FC = () => {
//     const [child, setChild] = useState<ReactNode>(<AppLoadingView/>);

//     useLayoutEffect(() => {
//         const script = document.createElement('script');
//         script.src = '{{{appclient}}}';
//         script.defer = true;

//         script.onload = () => {
//             window.app?.initialized().then((client) => {
//                 const platformService = new FreshservicePlatformService(client);
//                 platformService.resize();

//                 platformService.getDigiteamApiUrl$().subscribe({
//                     next: (backendUrl) => {
//                         if (!backendUrl) {
//                             console.error("❌ Backend URL is missing");
//                             setChild(
//                                 <PrimeReactProvider>
//                                     <LoadErrorView message={t('loadError.urlConfig')}/>
//                                 </PrimeReactProvider>
//                             );
//                             return;
//                         }
//                         setChild(
//                             <PlatformProvider platformService={platformService}>
//                                 <HashRouter>
//                                     <PrimeReactProvider>
//                                         <AppRoutes/>
//                                     </PrimeReactProvider>
//                                 </HashRouter>
//                             </PlatformProvider>
//                         );
//                     },
//                     error: (err) => {
//                         console.error("❌ Error al obtener backendUrl:", err);
//                         setChild(
//                             <PrimeReactProvider>
//                                 <LoadErrorView message={t('loadError.urlConfig')}/>
//                             </PrimeReactProvider>
//                         );
//                     }
//                 });
//             }).catch((err) => {
//                 console.error("❌ Error al inicializar la app:", err);
//                 setChild(
//                     <PrimeReactProvider>
//                         <LoadErrorView message={t('loadError.initApp')}/>
//                     </PrimeReactProvider>
//                 );
//             });
//         };

//         script.onerror = () => {
//             setChild(
//                 <PrimeReactProvider>
//                     <LoadErrorView message={t('loadError.clientScript')}/>
//                 </PrimeReactProvider>
//             );
//         };

//         if (!document.querySelector(`script[src="{{{appclient}}}"]`)) {
//             document.head.appendChild(script);
//         }

//         return () => {
//             document.head.removeChild(script);
//         };
//     }, []);

//     return <div>{child}</div>;
// };

// export default App;
