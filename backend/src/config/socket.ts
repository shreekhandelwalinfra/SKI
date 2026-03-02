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

// Convenience: emit investment change event
export function emitInvestmentUpdate() {
    if (io) {
        io.emit('investment:updated');
    }
}
