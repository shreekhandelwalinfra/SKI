import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketServer | null = null;

export function initSocket(httpServer: HTTPServer): SocketServer {
    io = new SocketServer(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });

    return io;
}

// Call this from controllers to emit events
export function getIO(): SocketServer | null {
    return io;
}

// Global broadcast wrapped with a robust logger
export function broadcastSocketEvent(event: string, payload?: any) {
    if (!io) {
        console.error(`[Socket] ❌ Failed to emit '${event}': io instance is null!`);
        return;
    }
    console.log(`[Socket] 📡 Broadcasting '${event}' to all clients`);
    if (payload) {
        io.emit(event, payload);
    } else {
        io.emit(event);
    }
}

// Convenience methods
export function emitInvestmentUpdate() {
    broadcastSocketEvent('investment:updated');
}

export function emitProfitUpdate(userId: string) {
    // Broadcasts to everyone for now, frontend will just refetch
    broadcastSocketEvent('profit:updated', { userId });
}

export function emitTicketUpdate() {
    broadcastSocketEvent('ticket:updated');
}
