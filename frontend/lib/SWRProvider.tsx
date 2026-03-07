'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig value={{
            revalidateOnFocus: false,   // WebSocket handles real-time updates
            revalidateOnReconnect: false, // Socket reconnect triggers mutate() instead
            dedupingInterval: 5000,      // Deduplicate identical requests within 5s
        }}>
            {children}
        </SWRConfig>
    );
}
