const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { SupportMessage } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

const connectedUsers = new Map();
const onlineNutritionists = new Set(); // socket IDs of currently connected nutritionists

function broadcastNutritionistStatus(io) {
  const count = onlineNutritionists.size;
  io.emit('nutritionist_status_changed', { online: count > 0, count });
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication token required'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.data.userId = decoded.userId;
      socket.data.userRole = decoded.userRole;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, userRole } = socket.data;
    const firstName = socket.handshake.auth?.firstName || 'Guest';
    connectedUsers.set(socket.id, { userId, firstName, userRole });

    socket.join(`${userRole}-room`);
    socket.join(`user-${userId}`); // private room for direct messages to this user

    if (userRole === 'nutritionist') {
      socket.join('nutritionist_support_pool');
      onlineNutritionists.add(socket.id);
      broadcastNutritionistStatus(io);
    } else {
      // Give newly connected users the current nutritionist availability
      const count = onlineNutritionists.size;
      socket.emit('nutritionist_status_changed', { online: count > 0, count });
    }

    // Legacy: join an arbitrary named room
    socket.on('join_room', ({ room }) => {
      socket.join(room);
      io.to(room).emit('receive_message', {
        system: true,
        content: `${firstName} (${userRole}) joined the chat`,
        timestamp: new Date().toISOString(),
      });
      io.to(room).emit('online_users', [...connectedUsers.values()]);
    });

    // Legacy: send to an arbitrary named room
    socket.on('send_message', ({ room, content }) => {
      if (!content || !content.trim()) return;
      io.to(room).emit('receive_message', {
        system: false,
        userId,
        firstName,
        userRole,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      });
    });

    // User → support pool: broadcast to all connected nutritionists
    socket.on('support_message', ({ content }) => {
      if (!content || !content.trim()) return;
      const trimmed = content.trim();
      const timestamp = new Date().toISOString();
      io.to('nutritionist_support_pool').emit('receive_support_message', {
        userId, username: firstName, content: trimmed, timestamp,
      });
      SupportMessage.create({
        userId,
        senderRole: 'user',
        senderId:   userId,
        senderName: firstName,
        content:    trimmed,
        createdAt:  new Date(),
      }).catch((err) => console.error('[chat-persist] support_message:', err.message));
    });

    // Nutritionist → specific user: private reply routed to user's private room
    socket.on('nutritionist_reply', ({ targetUserId, content }) => {
      if (!content || !content.trim() || !targetUserId) return;
      const trimmed = content.trim();
      const timestamp = new Date().toISOString();
      io.to(`user-${targetUserId}`).emit('private_message', {
        from: firstName, content: trimmed, timestamp,
      });
      SupportMessage.create({
        userId:     parseInt(targetUserId, 10),
        senderRole: 'nutritionist',
        senderId:   userId,
        senderName: firstName,
        content:    trimmed,
        createdAt:  new Date(),
      }).catch((err) => console.error('[chat-persist] nutritionist_reply:', err.message));
    });

    socket.on('user_typing', ({ room }) => {
      socket.to(room).emit('user_typing', { firstName, userRole });
    });

    // Explicit offline signal sent by the nutritionist client before disconnecting.
    // This fires while the socket is still live, guaranteeing io.emit reaches all users.
    socket.on('nutritionist_going_offline', () => {
      if (userRole === 'nutritionist' && onlineNutritionists.has(socket.id)) {
        onlineNutritionists.delete(socket.id);
        broadcastNutritionistStatus(io);
      }
    });

    // Fallback: handles browser close, crashes, or network drops
    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      if (userRole === 'nutritionist' && onlineNutritionists.has(socket.id)) {
        onlineNutritionists.delete(socket.id);
        broadcastNutritionistStatus(io);
      }
    });
  });
}

module.exports = { initSocket };
