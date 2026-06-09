/**
 * src/app/lib/socket.ts
 * Shared Socket.IO client instance.
 * The socket is created once and reused across the app.
 * It connects with the JWT token from localStorage so the server
 * can authenticate the socket without trusting any client-supplied userId.
 */
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually when the user is logged in
  auth: {
    // token is read lazily so it picks up the latest value each connection
    get token() {
      return localStorage.getItem('token') || '';
    },
  },
});
