'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

// 1. Create the singular global instance. 
// autoConnect: false ensures we don't spam the server until a component explicitly asks for it.
// reconnectionDelay and reconnectionDelayMax handle the Exponential Randomized Backoff protecting against DDoS on server restart.
const globalSocket = io(URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket'],
});

interface SocketContextProps {
    socket: Socket;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextProps | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        globalSocket.connect();

        const onConnect = () => { console.warn('🟢 React Socket connected:', globalSocket.id); setIsConnected(true); };
        const onDisconnect = () => { console.warn('🔴 React Socket disconnected'); setIsConnected(false); };
        const onConnectError = (err: any) => { console.error('❌ React Socket connection error:', err?.message); };

        globalSocket.on('connect', onConnect);
        globalSocket.on('disconnect', onDisconnect);
        globalSocket.on('connect_error', onConnectError);

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                if (globalSocket.disconnected) globalSocket.connect();
            } else {
                if (globalSocket.connected) globalSocket.disconnect();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            globalSocket.off('connect', onConnect);
            globalSocket.off('disconnect', onDisconnect);
            globalSocket.off('connect_error', onConnectError);
            globalSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: globalSocket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
}

// 3. Custom hook for components to easily consume the live socket
export function useSocket() {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
