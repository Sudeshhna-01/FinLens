const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { getClientDatabaseErrorMessage } = require('../utils/dbErrors');

const router = express.Router();
const prisma = new PrismaClient();

// Register — trim + validate email; normalize in code (no aggressive normalizeEmail for .edu etc.)
router.post('/register',
  [
    body('email').trim().notEmpty().isEmail().withMessage('Enter a valid email address'),
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg || `${e.path}: invalid`).join(' ');
        return res.status(400).json({ error: messages, errors: errors.array() });
      }

      const email = String(req.body.email).trim().toLowerCase();
      const name = String(req.body.name).trim();
      const { password } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        }
      });

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({ user, token });
    } catch (error) {
      console.error('Registration error:', error);
      const dbMsg = getClientDatabaseErrorMessage(error);
      res.status(500).json({
        error: dbMsg || 'Registration failed. Check the server terminal for details.'
      });
    }
  }
);

// Login
router.post('/login',
  [
    body('email').trim().notEmpty().isEmail().withMessage('Enter a valid email address'),
    body('password').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = errors.array().map((e) => e.msg || `${e.path}: invalid`).join(' ');
        return res.status(400).json({ error: messages, errors: errors.array() });
      }

      const email = String(req.body.email).trim().toLowerCase();
      const { password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      const dbMsg = getClientDatabaseErrorMessage(error);
      res.status(500).json({
        error: dbMsg || 'Login failed. Check the server terminal for details.'
      });
    }
  }
);

module.exports = router;
