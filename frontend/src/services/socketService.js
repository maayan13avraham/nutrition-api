import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
export const SUPPORT_ROOM = 'nutrition_support';

let socket = null;

// Single routing layer — ONE listener for receive_support_message prevents duplicates
const pendingMessages = [];
let dashboardHandler = null;
let badgeHandler = null;

export function registerDashboardHandler(fn) {
  dashboardHandler = fn;
  const msgs = [...pendingMessages];
  pendingMessages.length = 0;
  msgs.forEach(fn);
}
export function unregisterDashboardHandler() { dashboardHandler = null; }
export function registerBadgeHandler(fn) { badgeHandler = fn; }
export function unregisterBadgeHandler() { badgeHandler = null; }

function routeSupportMessage(msg) {
  if (dashboardHandler) {
    dashboardHandler(msg);
  } else {
    pendingMessages.push(msg);
  }
  if (badgeHandler) badgeHandler(msg);
}

export function connect() {
  if (socket?.connected) return socket;
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  socket = io(SOCKET_URL, {
    auth: {
      token,
      firstName: user.firstName || user.email || 'Guest',
    },
  });
  socket.on('receive_support_message', routeSupportMessage);
  return socket;
}

export function getSocket() {
  return socket;
}

// Legacy helpers for the shared named-room chat
export function joinRoom() {
  if (socket) socket.emit('join_room', { room: SUPPORT_ROOM });
}

export function sendMessage(content) {
  if (socket) socket.emit('send_message', { room: SUPPORT_ROOM, content });
}

export function emitTyping() {
  if (socket) socket.emit('user_typing', { room: SUPPORT_ROOM });
}

// Support pool — user side: sends to all connected nutritionists
export function sendSupportMessage(content) {
  if (socket) socket.emit('support_message', { content });
}

// Support pool — nutritionist side: private reply to a specific user
export function sendNutritionistReply(targetUserId, content) {
  if (socket) socket.emit('nutritionist_reply', { targetUserId, content });
}

// Subscribe/unsubscribe to nutritionist availability changes
export function onNutritionistStatus(callback) {
  if (socket) socket.on('nutritionist_status_changed', callback);
}

export function offNutritionistStatus(callback) {
  if (socket) socket.off('nutritionist_status_changed', callback);
}

// Called by nutritionists before logout so the server broadcasts offline status
// while the socket is still connected (more reliable than waiting for disconnect event).
export function notifyNutritionistOffline() {
  if (socket) socket.emit('nutritionist_going_offline');
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
