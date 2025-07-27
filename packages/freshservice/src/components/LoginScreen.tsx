import React, {FC, useState, useRef, useEffect} from 'react';
import {InputText} from 'primereact/inputtext';
import {Password} from 'primereact/password';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import {firstValueFrom} from 'rxjs';

import {usePlatform} from '../context/PlatformContext';
import {AuthService} from '../services/AuthService';
import {DigiteamApiService} from '../services/DigiteamApiService';

const authService = new AuthService();
const digiteam = new DigiteamApiService();

const LoginScreen: FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const platform = usePlatform();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const toast = useRef<Toast>(null);

    useEffect(() => {
        platform.resize('login');
        authService.setTenantUrl('https://gilbarcohml.digiteam.com.br');
        if (authService.isLoggedIn() && authService.isTokenValid()) {
            navigate('/home');
        }
    }, [platform, navigate]);

    const handleLogin = async () => {
        toast.current?.clear();

        if (!username || !password) {
            toast.current?.show({
                severity: 'warn',
                summary: t('login.required.summary'),
                detail: t('login.required.detail'),
            });
            return;
        }

        try {
            await firstValueFrom(authService.login$({username, password}));

            const cfg = await firstValueFrom(digiteam.getThirdPartyPluginConfig());

            if (!cfg) {
                navigate('/error_plugin', {
                    replace: true,
                    state: {message: t('loadError.plugin.notConfigured')},
                });
                return;
            }
            toast.current?.show({
                severity: 'success',
                summary: t('login.success'),
            });
            navigate('/home', {replace: true});
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: t('login.failed.summary'),
                detail: t('login.failed.detail'),
            });
        }
    };

    return (
        <>
            <Toast ref={toast}/>
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-0 m-0">
                <div className="border">

                    <div className="flex flex-col items-center p-4 pt-6">
                        <img
                            src="https://zendeskapphml.digiteam.com.br/assets/digiteam-logo.png"
                            alt="Logo"
                            className="w-16 h-16 rounded-full mb-4"
                        />

                        <div className="w-full mb-3">
                            <label htmlFor="username" className="block text-sm font-medium text-gray-800 mb-1">
                                {t('login.username') || 'Usuário'}
                            </label>
                            <InputText
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border border-gray-300 focus:border-blue-400 focus:ring-blue-300 rounded-md shadow-sm"
                                autoComplete="username"
                            />
                        </div>

                        <div className="w-full mb-0">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-1">
                                {t('login.password') || 'Senha'}
                            </label>
                            <Password
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                feedback={false}
                                toggleMask
                                className="w-full"
                                inputClassName="w-full border border-gray-300 focus:border-blue-400 focus:ring-blue-300 rounded-md shadow-sm"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <div className="bg-gray-100/60 h-14 pt-2 pr-2 flex justify-end">
                        <div className="bg-gray-100/60 h-10 pr-2 flex justify-end items-center">
                            <Button
                                label={t('login.button') || 'Entrar'}
                                icon="pi pi-arrow-right"
                                iconPos="right"
                                className="bg-green-700/60 hover:bg-green-800/60 border-green-800/60 text-white text-sm px-4 py-2 rounded-full"
                                onClick={handleLogin}
                                disabled={!username || !password}
                            />
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                    v2025.04 {t(`app.products.${platform.getProductName()}`)}
                </p>
            </div>
        </>
    );
};
export default LoginScreen;
