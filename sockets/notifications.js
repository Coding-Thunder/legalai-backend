// File: backend/sockets/notifications.js
/**
 * Socket.io notification handlers
 *
 * Example: can handle live chat, case updates, AI draft updates
 */

module.exports = (io, socket) => {
  // Example: listen to client sending a message in a case chat
  socket.on('chat:message', ({ caseId, message, senderId }) => {
    // Broadcast message to all users in this case
    io.to(`case:${caseId}`).emit('chat:message', { caseId, message, senderId, timestamp: new Date() });
  });

  // Additional events can be added here
};
