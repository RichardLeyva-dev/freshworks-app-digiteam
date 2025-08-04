import React, { useEffect, useRef } from 'react';
import { Card }    from 'primereact/card';
import { Message } from 'primereact/message';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate }    from 'react-router-dom';
import { Button } from 'primereact/button';
import { AuthService } from '../services/AuthService';
import { Toast } from 'primereact/toast';
import { usePlatform } from '../context/PlatformContext';

interface LoadErrorViewProps {
  message?: string;
}
const authService = new AuthService();
const LoadErrorViewPlugin: React.FC<LoadErrorViewProps> = ({ message }) => {
  const { t }  = useTranslation();
  const { state } = useLocation();
  const stateMsg  = (state as { message?: string })?.message;
  const toast = useRef<Toast>(null);
   const navigate = useNavigate();

const platform = usePlatform();

  useEffect(() => {
    platform.resize('home');
  }, []);

 const handleLogout = () => {
    toast.current?.show({
      severity: 'info',
      summary: t('toast.logout.summary'),
      life: 2000,
    });

    setTimeout(() => {
        authService.logout();
      navigate('/');
    }, 2000);
  };
  const text = message ?? stateMsg ?? t('loadError.plugin.notConfigured');
  return (
    <div className="h-screen flex items-center justify-center bg-white-100">
  <Toast ref={toast} />
  <Card title={t('loadError.title')} className="w-full max-w-md">
    <Message severity="warn" text={text} />

    <div className="w-full flex justify-center mt-5">
      <Button
        label={t('home.logout')}
        className="text-gray-400 bg-transparent border-0 font-extralight"
        onClick={handleLogout}
      />
    </div>

  </Card>
</div>
  );
};
export default LoadErrorViewPlugin;
