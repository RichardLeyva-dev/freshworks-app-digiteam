import React from 'react';
import {Card} from 'primereact/card';
import {Message} from 'primereact/message';
import {useTranslation} from 'react-i18next';

interface LoadErrorViewProps {
    message?: string;
}

const LoadErrorView: React.FC<LoadErrorViewProps> = ({message}) => {
    const {t} = useTranslation();
    return (
        <div className="h-screen flex items-center justify-center bg-gray-100 p-8">
            <Card title={t('loadError.title')} className="w-full max-w-md">
                <p className="mb-3">
                    {message ?? t('loadError.description')}
                </p>
                <Message severity="warn" text={t('loadError.action')}/>
            </Card>
        </div>
    );
};
export default LoadErrorView;
