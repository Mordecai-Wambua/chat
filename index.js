import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import engine from 'ejs-mate';
import { connectDB, sequelize, disconnectDB } from './config/database.js';
import { authMiddleware } from './middleware/auth.js';

// Redis for sessions
import { sessionMiddleware } from './config/redisConfig.js';

// Routes
import api from './routes/auth.js';
import chat from './routes/chat.js';

// Logs
import logger from './middleware/logger.js';

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(logger);
app.use(sessionMiddleware);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static('public'));

// routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Routers
app.use('/', api);
app.use('/chat', authMiddleware, chat(io));

// Connect to MongoDB and start server
(async () => {
  await connectDB();
  sequelize
    .sync()
    .then(() => console.log('Database synced successfully'))
    .catch((error) => console.error('Error syncing database:', error.message));

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    await disconnectDB();
    console.log('Server shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await disconnectDB();
    console.log('Server shutting down gracefully');
    process.exit(0);
  });
})();
