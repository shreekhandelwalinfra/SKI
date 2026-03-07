'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

export function SWRProvider({ children }: { children: ReactNode }) {
    return (
        <SWRConfig value={{
            revalidateOnFocus: false,     // WebSocket handles real-time updates
            revalidateOnReconnect: false,  // Socket reconnect triggers mutate() instead
            revalidateIfStale: false,      // Don't re-fetch if cached data exists — WebSocket will mutate() when needed
            dedupingInterval: 10000,       // Deduplicate identical requests within 10s
        }}>
            {children}
        </SWRConfig>
    );
}
