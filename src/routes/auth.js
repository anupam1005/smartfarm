import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../config/mongodb.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  if (!req.is('application/json')) {
    return res.status(400).json({
      error: 'Content-Type must be application/json'
    });
  }
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      data: {
        id: user._id,
        username: user.username,
        role: user.role || 'viewer',
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Database connection failed'
    });
  }
});

router.post('/signup', async (req, res) => {
  if (!req.is('application/json')) {
    return res.status(400).json({
      error: 'Content-Type must be application/json'
    });
  }
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({
        error: 'Username, password and email are required'
      });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }

    const user = new User({
      username,
      password,
      email,
      role: 'viewer'
    });

    await user.save();

    // Create JWT token for immediate login
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      data: {
        id: user._id,
        username: user.username,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Failed to create user'
    });
  }
});

export default router;