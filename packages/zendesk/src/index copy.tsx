import React from 'react';
import ReactDOM from 'react-dom/client';

// ✅ Importar los estilos globales desde Freshservice
import '../../freshservice/src/index.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// ✅ Importar inicialización de traducciones
import '../../freshservice/src/i18n';

// ✅ Importar el componente
import LoadErrorView from '../../freshservice/src/components/LoadErrorView';

const root = document.getElementById('root');
if (!root) throw new Error('No root element found');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <LoadErrorView message="Test message from Zendesk project" />
  </React.StrictMode>
);
