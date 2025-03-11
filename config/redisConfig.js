import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  //   legacyMode: true, // Ensures compatibility with older Redis clients
});

await redisClient.connect().catch(console.error);

// Create Redis session store (correct way)
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'session:', // Optional prefix for session keys
});

// Configure session middleware
const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || 'yourFallbackSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true, // Prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
  },
});

export { redisClient, sessionMiddleware };
