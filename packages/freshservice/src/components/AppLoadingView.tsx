import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useTranslation } from 'react-i18next';

const AppLoadingView = () => {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
      <ProgressSpinner />
      <p className="text-gray-700 text-sm">{t('appLoading')}</p>
    </div>
  );
};

export default AppLoadingView;
