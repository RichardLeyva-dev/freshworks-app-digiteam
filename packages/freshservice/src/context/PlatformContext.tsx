import React, { createContext, useContext } from 'react';
import { IPlatformAdapter } from '../adapters/PlatformAdapter';

type PlatformContextType = {
    platformService: IPlatformAdapter;
};

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export const PlatformProvider = ({
    platformService,
    children,
}: {
    platformService: IPlatformAdapter;
    children: React.ReactNode;
}) => (
    <PlatformContext.Provider value={{ platformService }}>
        {children}
    </PlatformContext.Provider>
);

export const usePlatform = (): IPlatformAdapter => {
    const context = useContext(PlatformContext);
    if (!context) {
        throw new Error('usePlatform must be used within a PlatformProvider');
    }
    return context.platformService;
};
