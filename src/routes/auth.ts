import express from 'express';
import bcrypt from 'bcrypt';
import { User } from '../config/mongodb';
import mongoose from 'mongoose';
import { Request, Response } from 'express';

const router = express.Router();

router.post('/signup', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({ error: 'Username must be between 3 and 50 characters' });
  }

  if (password.length < 6 || password.length > 50) {
    return res.status(400).json({ error: 'Password must be between 6 and 50 characters' });
  }

  try {
    if (!mongoose.connection.readyState) {
      console.error('Database connection not available during signup attempt');
      return res.status(503).json({ error: 'Database connection is not available. Please try again later.' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username }).catch(err => {
      console.error('Error checking for existing user:', err);
      throw new Error('Database operation failed');
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      username,
      password: hashedPassword,
      role: 'farmer'
    });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error: unknown) {
    console.error('Signup error:', error);
    if (error instanceof Error) {
      if ((error as any).name === 'MongoServerSelectionError') {
        return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
      } else if ((error as any).code === 11000) {
        return res.status(400).json({ error: 'Username is already taken. Please choose a different username.' });
      } else if ((error as any).name === 'ValidationError') {
        return res.status(400).json({ error: 'Invalid input data. Please check your username and password.' });
      }
    }
    console.error('Unexpected signup error:', error);
    res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Get user from database
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Send user data (excluding password)
    const { password: userPassword, ...userData } = user.toObject();
    res.json(userData);
  } catch (error: unknown) {
    console.error('Login error:', error);
    if (error instanceof Error) {
      if ((error as any).name === 'MongoServerSelectionError') {
        return res.status(503).json({ error: 'Database connection failed' });
      }
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;