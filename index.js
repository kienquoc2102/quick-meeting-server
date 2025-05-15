// server/index.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: { origin: "*" }
});

const users = {}; // { roomId: { socketId: username } }

io.on('connection', socket => {
  console.log('🔌 New user connected:', socket.id);

  socket.on('join', ({ roomId, username }) => {
    if (!users[roomId]) users[roomId] = {};
    users[roomId][socket.id] = username;
    socket.join(roomId);

    // Send other users in the room to the new user
    const otherUsers = Object.keys(users[roomId])
      .filter(id => id !== socket.id)
      .map(id => ({ id, username: users[roomId][id] }));

    socket.emit('all-users', otherUsers);

    // Notify others in room
    socket.to(roomId).emit('user-joined', { id: socket.id, username });
  });

  socket.on('offer', ({ offer, to }) => {
    socket.to(to).emit('offer', { offer, from: socket.id });
  });

  socket.on('answer', ({ answer, to }) => {
    socket.to(to).emit('answer', { answer, from: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, to }) => {
    socket.to(to).emit('ice-candidate', { candidate, from: socket.id });
  });

  socket.onAny((event, ...args) => {
  console.log(`📩 Received event: ${event}`, args);
});

  socket.on('disconnect', () => {
    for (const roomId in users) {
      if (users[roomId][socket.id]) {
        const username = users[roomId][socket.id];
        delete users[roomId][socket.id];
        socket.to(roomId).emit('user-left', { id: socket.id, username });
        if (Object.keys(users[roomId]).length === 0) delete users[roomId];
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5090;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});