import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_super_secret_jwt_key_2026';

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// POST /api/auth/signup (Screen 1)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, avatar, languagePref } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Conflict', message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        languagePref: languagePref || 'en',
        avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      }
    });

    const token = generateToken(newUser.id, newUser.email);

    res.status(201).json({
      message: 'Account created successfully',
      user: sanitizeUser(newUser),
      token
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/auth/login (Screen 1)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/me or /api/auth/me (Screen 2, 12)
const getMeHandler = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        savedDestinations: {
          include: { city: true }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User profile not found.' });
    }

    res.status(200).json({
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

router.get('/me', authenticateToken, getMeHandler);

// PUT /api/me or /api/auth/profile (Screen 12)
const updateMeHandler = async (req, res) => {
  try {
    const { name, email, avatar, languagePref, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found.' });
    }

    const updateData = {};

    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (languagePref) updateData.languagePref = languagePref;

    if (email && email.toLowerCase().trim() !== user.email) {
      const emailCheck = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      if (emailCheck) {
        return res.status(409).json({ error: 'Conflict', message: 'Email is already in use by another account.' });
      }
      updateData.email = email.toLowerCase().trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Validation Error', message: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Current password is incorrect.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Validation Error', message: 'New password must be at least 6 characters long.' });
      }
      updateData.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      include: {
        savedDestinations: { include: { city: true } }
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser)
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

router.put('/profile', authenticateToken, updateMeHandler);
router.put('/me', authenticateToken, updateMeHandler);

// DELETE /api/me or /api/auth/account (Screen 12)
const deleteMeHandler = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.userId }
    });

    res.status(200).json({
      message: 'User account deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

router.delete('/account', authenticateToken, deleteMeHandler);

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email address is required.' });
    }
    res.status(200).json({
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

export default router;
export { getMeHandler, deleteMeHandler };
message: 'Profile updated successfully',
  user: sanitizeUser(updatedUser)
    });
  } catch (error) {
  console.error('Update Profile Error:', error);
  res.status(500).json({ error: 'Internal Server Error', message: error.message });
}
};

router.put('/profile', authenticateToken, updateMeHandler);
router.put('/me', authenticateToken, updateMeHandler);

// DELETE /api/me or /api/auth/account (Protected)
const deleteMeHandler = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.user.userId }
    });

    clearRefreshTokenCookie(res);
    res.status(200).json({ message: 'User account deleted successfully.' });
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

router.delete('/account', authenticateToken, deleteMeHandler);

export default router;
export { getMeHandler, deleteMeHandler };
