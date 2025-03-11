import express from 'express';
import bcryptjs from 'bcryptjs';
import User from '../models/User.js';
import { redisClient } from '../config/redisConfig.js';

const router = express.Router();

router.get('/check-session', (req, res) => {
  if (req.session.user) {
    const roleRoutes = {
      Admin: '/admin',
      Receptionist: '/reception',
      Technician: '/technician',
      Doctor: '/doctor',
    };

    return res.json({
      loggedIn: true,
      redirect: roleRoutes[req.session.user.role] || '/',
    });
  }

  return res.json({ loggedIn: false });
});

// Render login page
router.get('/register', (req, res) => {
  res.render('register');
});

// Handle user registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  console.log('Registering user:', username, email, password);

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All input fields are required!' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists!' });
    }
    const hashedPassword = await bcryptjs.hash(password, 8);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: 'User registered successfully', redirect: '/login' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle login authentication
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcryptjs.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = { email, username: user.username };
    console.log(req.session.user);
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).json({ error: 'Session error' });
      }
      return res.json({ redirect: '/chat' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error, please try again' });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Server error during logout' });
    }
    res.clearCookie('connect.sid').redirect('/login'); // Redirect to login after logout
  });
});

router.get('/chat-rooms', (req, res) => {
  const rooms = [
    { name: 'General', users: 10 },
    { name: 'Random', users: 5 },
    { name: 'Tech Talk', users: 3 },
  ];

  return res.status(200).json(rooms);
});

export default router;
