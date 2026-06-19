const { Server } = require('socket.io');

// Track connected users: socketId → { userId, firstName, userRole }
const connectedUsers = new Map();

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    const { userId, firstName = 'Guest', userRole = 'user' } = socket.handshake.auth;
    connectedUsers.set(socket.id, { userId, firstName, userRole });

    // EVENT 1: join_room — client joins the support chat room
    socket.on('join_room', ({ room }) => {
      socket.join(room);

      // EVENT 3: receive_message — system notice to the room
      io.to(room).emit('receive_message', {
        system: true,
        content: `${firstName} (${userRole}) joined the chat`,
        timestamp: new Date().toISOString(),
      });

      // EVENT 5: online_users — push current participant list to the whole room
      io.to(room).emit('online_users', [...connectedUsers.values()]);
    });

    // EVENT 2: send_message — client sends a chat message to the room
    socket.on('send_message', ({ room, content }) => {
      if (!content || !content.trim()) return;
      // EVENT 3: receive_message — broadcast to entire room including sender
      io.to(room).emit('receive_message', {
        system: false,
        userId,
        firstName,
        userRole,
        content: content.trim(),
        timestamp: new Date().toISOString(),
      });
    });

    // EVENT 4: user_typing — relay typing indicator to everyone else in the room
    socket.on('user_typing', ({ room }) => {
      socket.to(room).emit('user_typing', { firstName, userRole });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.id);
      // Notify every room this socket was in (skip the socket's own default room)
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          io.to(room).emit('receive_message', {
            system: true,
            content: `${firstName} left the chat`,
            timestamp: new Date().toISOString(),
          });
          io.to(room).emit('online_users', [...connectedUsers.values()]);
        }
      });
    });
  });
}

module.exports = { initSocket };
