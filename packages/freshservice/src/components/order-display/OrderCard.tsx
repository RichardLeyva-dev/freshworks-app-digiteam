import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { OrderDetailModel } from '../../models/order-detail-model';
import { t } from 'i18next';


interface Props {
    order: OrderDetailModel;
    expanded: boolean;
    onToggle: () => void;
}

const OrderCard: React.FC<Props> = ({ order, expanded, onToggle }) => {
    const op = useRef<OverlayPanel>(null);
    return (
        <div className="w-full max-w-sm mb-4 shadow-sm border relative">
            <div className='p-4'>
                <div className="flex justify-between items-start">
                    <div className="flex items-center text-gray-700 gap-2 text-xl font-semibold">
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `#${order.statusColor}` }}
                        >
                            <i className="pi pi-check text-white text-xs" />
                        </div>
                        {order.status}
                    </div>

                    <i
                        className="pi pi-ellipsis-v text-gray-500 cursor-pointer text-lg"
                        onClick={(e) => op.current?.toggle(e)}
                    />
                    <OverlayPanel ref={op}>
                        <div
                            onClick={onToggle}
                            className="cursor-pointer flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
                        >
                            <i className="pi pi-list" />
                            <span className="text-sm">{t('orderCard.historyStatus')}</span>
                        </div> <div
                            onClick={onToggle}
                            className="cursor-pointer flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded"
                        >
                            {/* <i className="pi pi-times-circle " />
                            <span className="text-sm">{t('orderCard.historyCancel')}</span> */}

                        </div>
                    </OverlayPanel>
                </div>

                <div className="text-xs text-gray-800 mt-3 font-bold">
                    {order.orderType?.name || t('orderCard.typeNotInformed')}
                </div>

                <div className="text-xs text-gray-600 mt-1">
                    {t('orderCard.orderNumber')}: {order.code}
                </div>

                <div className="text-xs text-gray-600 mt-1">
                    {t('orderCard.dueDate')}: {order.dueDate && (() => {
                        const d = new Date(order.dueDate);
                        const pad = (n: number) => String(n).padStart(2, '0');

                        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
                            `${pad(d.getHours())}:${pad(d.getMinutes())}`;
                    })()}


                </div>
                {expanded && order.historicItems?.length ? (
                    <div className="relative mt-4 pl-8">

                        <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300/60 z-0" />

                        <div className="space-y-6 relative z-10">
                            {order.historicItems.map((h, idx) => (
                                <div key={idx} className="relative flex items-start right-9 gap-3">

                                    <div className="pt-2 relative z-10">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: h.color }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
                                                <i className="pi pi-check text-white text-[10px]" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col text-xs text-gray-800 leading-tight">
                                        <span className="font-semibold text-black whitespace-nowrap">{h.title}</span>
                                        <span
                                            className="text-gray-500 whitespace-nowrap">{new Date(h.createdOn).toLocaleString('pt-BR')}</span>
                                        <span className="text-gray-700 whitespace-nowrap">{h.author}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : null}

            </div>

            <div className="bg-gray-200/30 w-full p-2 flex justify-end">
                <Button
                    label={expanded ? 'Menos' : 'Mais'}
                    icon={expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'}
                    className="bg-[#6AA84F] border-none text-white text-sm rounded-full px-4 py-2"
                    onClick={onToggle}
                />
            </div>

        </div>
    );
};

export default OrderCard;
