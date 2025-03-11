import express from 'express';
import { formatMessage } from '../utils/messages.js';
import { userJoin, getCurrentUser, userLeave } from '../utils/users.js';
import { redisClient } from '../config/redisConfig.js';

const router = express.Router();
const bot = 'ChatCord Bot';

export default (io) => {
  // Global Socket.IO event handlers
  io.on('connection', (socket) => {
    // When a user joins a room
    socket.on('joinRoom', async ({ room, username }) => {
      // Add user to our in-memory tracking
      const user = userJoin(socket.id, room, username);
      socket.join(user.room);

      try {
        // Add user details to Redis hash for the room
        // Key: room:{room}:users, Field: socket.id, Value: username
        await redisClient.hSet(`room:${room}:users`, socket.id, username);
        // Get current count of users in the room
        const count = await redisClient.hLen(`room:${room}:users`);

        // Send welcome message to the joining user
        socket.emit('message', formatMessage(bot, 'Welcome to ChatCord!'));
        // Broadcast to others in the room, including the user count
        socket.broadcast
          .to(user.room)
          .emit(
            'message',
            formatMessage(
              bot,
              `${user.username} has joined the chat. Current users: ${count}`
            )
          );
      } catch (err) {
        console.error('Error updating Redis on joinRoom:', err);
      }
    });

    // Listen for chat messages
    socket.on('chatMessage', async ({ room, username, message }) => {
      const user = getCurrentUser(socket.id);
      if (user) {
        socket.broadcast
          .to(user.room)
          .emit('message', formatMessage(user.username, message));
      }
    });

    // Handle disconnects
    socket.on('disconnect', async () => {
      const user = userLeave(socket.id);
      if (user) {
        try {
          // Remove the user from the Redis hash for the room
          await redisClient.hDel(`room:${user.room}:users`, socket.id);
          // Get the updated count of users in the room
          const count = await redisClient.hLen(`room:${user.room}:users`);
          io.to(user.room).emit(
            'message',
            formatMessage(
              bot,
              `${user.username} has left the chat. Current users: ${count}`
            )
          );
        } catch (err) {
          console.error('Error updating Redis on disconnect:', err);
        }
      }
    });
  });

  // GET /chat - Render page with list of chatrooms from Redis
  router.get('/', async (req, res) => {
    try {
      // Retrieve all chatrooms from a Redis set named 'chatrooms'
      const chatRooms = await redisClient.sMembers('chatrooms');
      res.render('chat', { chatRooms });
    } catch (err) {
      console.error('Error retrieving chatrooms from Redis:', err);
      res.render('chat', { chatRooms: [] });
    }
  });

  // POST /chat/create - Create a new chatroom and add it to Redis
  router.post('/create', async (req, res) => {
    const { roomName } = req.body;

    try {
      // Add the room to a Redis set so that it remains unique
      await redisClient.sAdd('chatrooms', roomName);
      return res.status(201).json({ message: 'success' });
    } catch (err) {
      console.error('Error adding chatroom to Redis:', err);
      return res.status(400).json({ message: 'Error adding chatroom' });
    }
  });

  // GET /chat/:room - Render a specific chatroom page
  router.get('/:room', (req, res) => {
    const { room } = req.params;
    res.render('chatroom', { room, username: req.session.user.username });
  });

  return router;
};
