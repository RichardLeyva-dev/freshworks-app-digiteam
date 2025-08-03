import React, {useEffect, useState, useRef} from 'react';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {useNavigate} from 'react-router-dom';
import {usePlatform} from '../context/PlatformContext';
import {t} from 'i18next';
import {DigiteamApiService} from '../services/DigiteamApiService';
import {OrderDetailModel} from '../models/order-detail-model';
import OrderCard from './order-display/OrderCard';
import {AuthService} from '../services/AuthService';
import {ThirdPartyConfigService} from '../services/ThirdPartyConfigService';

const authService = new AuthService();

const HomeScreen: React.FC = () => {
    const [orders, setOrders] = useState<OrderDetailModel[]>([]);
    const [configService, setConfig] = useState<ThirdPartyConfigService | null>(null);
    const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
    const toast = useRef<Toast>(null);
    const navigate = useNavigate();
    const platform = usePlatform();
    const digiteam = new DigiteamApiService();
    const [limit, setLimit] = useState<number>(Infinity);
    const [isLoading, setIsLoading] = useState(true);
    const canCreateOrder = orders.length < limit;


    useEffect(() => {
        platform.resize('home');
    }, []);

    useEffect(() => {
        let isMounted = true;
        const sub = digiteam
            .getThirdPartyPluginConfig()
            .subscribe((cfg) => {
                if (!isMounted) {
                    return;
                }
                if (cfg) {
                    console.log('✅ Config loaded:', cfg);
                    const conf = new ThirdPartyConfigService(cfg);
                    setConfig(conf);
                    setLimit(cfg.conditions?.maxOrdersPerTicket ?? Infinity);
                } else {
                    console.warn('⚠️ Config is null');
                    navigate('/error_plugin');
                }
            });
        return () => {
            setIsLoading(false);
            isMounted = false;
            sub.unsubscribe();
        };
    }, [navigate]);

    const toggleCard = (index: number) => {
        setExpandedCardIndex(prev => (prev === index ? null : index));
    };

    const handleLogout = () => {
        toast.current?.show({
            severity: 'info',
            summary: t('toast.logout.summary'),
            life: 2000,
        });
        setTimeout(() => {
            setIsLoading(false);
            authService.logout();
            navigate('/');
        }, 2000);
    };

    useEffect(() => {
        if (!configService) return;

        const sub = platform.getTicketId().subscribe({
            next: (ticketId) => {
                console.log('getting ticket');

                const digiteam = new DigiteamApiService();
                digiteam
                    .getOrderByTicketId(configService.getTicketPrefix(), Number(ticketId))
                    .subscribe({
                        next: (orders) => {
                            const sortedOrders = (orders ?? [])
                                .filter(o => o.id !== undefined)
                                .sort((a, b) => b.id! - a.id!);
                            setOrders(sortedOrders);
                        },
                        complete: () => {
                            setIsLoading(false);
                        },
                        error: (err) => {
                            console.error('Error fetching orders', err);
                            setIsLoading(false);
                        },
                    });
            },
        });

        return () => sub.unsubscribe();
    }, [platform, configService]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-80">
                <div className="flex flex-col items-center space-y-2">
                    <i className="pi pi-spin pi-spinner text-blue-500 text-xl"/>
                    <span className="text-gray-600 text-sm">{t('loading')}</span>
                </div>
            </div>

        );
    }

    return (
        <div className="h-screen overflow-y-auto bg-gray-50 p-4 flex flex-col items-center">
            <Toast ref={toast}/>
            <div className="w-full flex justify-start mb-4">
                <Button
                    label={t('home.newOrder') ?? ''}
                    icon="pi pi-plus"
                    disabled={!canCreateOrder}
                    className="bg-blue-500 border-blue-600 text-white rounded-none px-4 py-2"
                    onClick={() => navigate('/orderCreateFormView')}
                />
            </div>
            {orders.length > 0 ? (
                orders.map((order, index) => (
                    <OrderCard
                        key={order.code}
                        order={order}
                        expanded={expandedCardIndex === index}
                        onToggle={() => toggleCard(index)}
                    />
                ))
            ) : (
                <p className="text-gray-500 text-sm mt-4">{t('home.noOrders')}</p>
            )}
            <div className="w-full flex justify-center mb-4">
                <Button
                    label={t('home.logout') ?? ''}
                    className="mt-5 text-gray-400 bg-transparent border-0 font-extralight"
                    onClick={handleLogout}
                />
            </div>
            <p className="text-xs text-gray-500 mt-3">
                v2025.04 {t(`app.products.${platform.getProductName()}`)}
            </p>
        </div>
    );
};
export default HomeScreen;
