import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_super_secret_jwt_key_2026';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'globetrotter_refresh_token_secret_7d_2026';

// Email validation helper
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.toLowerCase().trim());
};

// Access Token: Short-lived (15 minutes)
const generateAccessToken = (userId, email) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '15m' });
};

// Refresh Token: Long-lived (7 days) & DB persisted
const generateRefreshToken = async (userId, email) => {
  const token = jwt.sign({ userId, email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  return token;
};

// Set HTTP-Only Cookie helper (Protects against XSS attacks)
const setRefreshTokenCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

// Clear HTTP-Only Cookie helper
const clearRefreshTokenCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
};

const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, avatar, languagePref } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Name, email, and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please provide a valid email address.' });
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
        avatar: avatar || null
      }
    });

    const accessToken = generateAccessToken(newUser.id, newUser.email);
    const refreshToken = await generateRefreshToken(newUser.id, newUser.email);

    // Set secure HTTP-Only Cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      message: 'Account created successfully',
      user: sanitizeUser(newUser),
      token: accessToken,
      accessToken,
      expiresIn: '15m'
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Validation Error', message: 'Email and password are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please enter a valid email address.' });
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

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = await generateRefreshToken(user.id, user.email);

    // Set secure HTTP-Only Cookie
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token: accessToken,
      accessToken,
      expiresIn: '15m'
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/auth/refresh (Reads HTTP-Only Cookie or request body)
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Validation Error', message: 'Refresh token cookie is missing.' });
    }

    // Verify DB persistence
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken }
    });

    if (!storedToken) {
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or revoked refresh token.' });
    }

    // Check expiration date
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      clearRefreshTokenCookie(res);
      return res.status(401).json({ error: 'Unauthorized', message: 'Refresh token expired. Please log in again.' });
    }

    // Verify JWT payload
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
        clearRefreshTokenCookie(res);
        return res.status(403).json({ error: 'Forbidden', message: 'Invalid refresh token.' });
      }

      // Rotate Refresh Token: delete old token, issue new tokens and updated HTTP-Only Cookie
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });

      const newAccessToken = generateAccessToken(decoded.userId, decoded.email);
      const newRefreshToken = await generateRefreshToken(decoded.userId, decoded.email);

      setRefreshTokenCookie(res, newRefreshToken);

      res.status(200).json({
        accessToken: newAccessToken,
        expiresIn: '15m'
      });
    });
  } catch (error) {
    console.error('Token Refresh Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/auth/logout (Revokes Refresh Token & Clears Cookie)
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }
    clearRefreshTokenCookie(res);
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/me or /api/auth/me (Protected)
const getMeHandler = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        savedDestinations: { include: { city: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User profile not found.' });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

router.get('/me', authenticateToken, getMeHandler);

// PUT /api/me or /api/auth/profile (Protected)
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
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Validation Error', message: 'Please provide a valid email address.' });
      }
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
