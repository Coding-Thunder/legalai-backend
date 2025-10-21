// File: backend/sockets/index.js
/**
 * Socket.io setup
 *
 * Handles connection and delegates to event modules
 */

const notifications = require('./notifications');

const setupSockets = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join rooms based on userId if provided
    socket.on('join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });

    // Handle notifications
    notifications(io, socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = setupSockets;
