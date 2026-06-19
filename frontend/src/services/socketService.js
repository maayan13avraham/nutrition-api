import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const SUPPORT_ROOM = 'nutrition_support';

let socket = null;

export function connect() {
  if (socket?.connected) return socket;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  socket = io(SOCKET_URL, {
    auth: {
      userId: user.userId,
      firstName: user.firstName || user.email || 'Guest',
      userRole: user.userRole || 'user',
    },
  });
  return socket;
}

export function joinRoom() {
  if (socket) socket.emit('join_room', { room: SUPPORT_ROOM });
}

export function sendMessage(content) {
  if (socket) socket.emit('send_message', { room: SUPPORT_ROOM, content });
}

export function emitTyping() {
  if (socket) socket.emit('user_typing', { room: SUPPORT_ROOM });
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
