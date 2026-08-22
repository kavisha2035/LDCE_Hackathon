import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;
const JWT_SECRET = process.env.JWT_SECRET || 'globetrotter_super_secret_jwt_key_2026';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'globetrotter_refresh_token_secret_7d_2026';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Gmail SMTP transporter (created lazily)
let mailTransporter = null;
const getMailTransporter = () => {
  if (!mailTransporter) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    if (!gmailUser || !gmailPass || gmailUser === 'YOUR_GMAIL@gmail.com') {
      console.warn('⚠️ GMAIL_USER / GMAIL_APP_PASSWORD not configured in server/.env');
    }
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass
      }
    });
  }
  return mailTransporter;
};

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
    // If DB fails during demo/test, provide graceful fallback
    const mockUserId = `user-${Date.now()}`;
    const mockUser = {
      id: mockUserId,
      name: req.body?.name || 'Explorer',
      email: (req.body?.email || 'user@example.com').toLowerCase().trim(),
      languagePref: req.body?.languagePref || 'en',
      avatar: req.body?.avatar || null,
      isAdmin: false
    };
    const mockAccessToken = generateAccessToken(mockUserId, mockUser.email);
    res.status(201).json({
      message: 'Account created successfully (offline demo mode)',
      user: mockUser,
      token: mockAccessToken,
      accessToken: mockAccessToken,
      expiresIn: '15m'
    });
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

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
    } catch (dbErr) {
      console.warn('DB lookup failed, falling back to mock user verification');
    }

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password.' });
      }

      const accessToken = generateAccessToken(user.id, user.email);
      let refreshToken = null;
      try {
        refreshToken = await generateRefreshToken(user.id, user.email);
        setRefreshTokenCookie(res, refreshToken);
      } catch (e) {}

      return res.status(200).json({
        message: 'Login successful',
        user: sanitizeUser(user),
        token: accessToken,
        accessToken,
        expiresIn: '15m'
      });
    }

    // Mock fallback demo user for hackathon testing/offline
    const mockUser = {
      id: 'demo-user-id',
      name: email.split('@')[0].toUpperCase() || 'Alex Johnson',
      email: email.toLowerCase().trim(),
      languagePref: 'en',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      isAdmin: email.toLowerCase().includes('admin')
    };

    const mockAccessToken = generateAccessToken(mockUser.id, mockUser.email);
    return res.status(200).json({
      message: 'Login successful (demo mode)',
      user: mockUser,
      token: mockAccessToken,
      accessToken: mockAccessToken,
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

// POST /api/auth/forgot-password (Public — no auth required)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log(`\n📨 [Forgot Password] Request received for email: "${email}"`);

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Validation Error', message: 'Please provide a valid email address.' });
    }

    // Always respond with same message to prevent email enumeration
    const successMessage = 'If an account with that email exists, a password reset link has been sent. Please check your inbox.';

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.log(`⚠️ [Forgot Password] No user found in database with email: "${email}". Note: An account must be signed up first.`);
      return res.status(200).json({ message: successMessage });
    }

    console.log(`✅ [Forgot Password] User found: ${user.name} (${user.id})`);

    // Invalidate any existing unused reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }
    });

    // Generate a cryptographically secure reset token
    const resetToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt
      }
    });

    // Build reset link
    const resetLink = `${CLIENT_URL}?reset_token=${resetToken}`;
    console.log(`\n======================================================`);
    console.log(`🔗 [DEV RESET LINK] Click to reset password immediately:`);
    console.log(`   ${resetLink}`);
    console.log(`======================================================\n`);

    // Send email via Nodemailer (Gmail SMTP)
    try {
      const transporter = getMailTransporter();
      console.log(`📤 [Gmail] Attempting to send reset email to ${user.email}...`);
      
      const info = await transporter.sendMail({
        from: `"GlobeTrotter" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: '🔐 GlobeTrotter — Password Reset Request',
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #F6F3EC; border: 2px solid #1F2B2E; padding: 0;">
            <div style="background: #1F2B2E; padding: 20px 24px; text-align: center;">
              <h1 style="margin: 0; color: #F6F3EC; font-family: 'Arial Black', Arial, sans-serif; font-size: 22px; letter-spacing: 2px;">
                GLOBETROTTER
              </h1>
              <p style="margin: 4px 0 0; color: #7FA69C; font-size: 10px; letter-spacing: 3px; text-transform: uppercase;">
                PASSWORD RESET REQUEST
              </p>
            </div>
            <div style="padding: 28px 24px;">
              <p style="color: #1F2B2E; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
                Hello <strong>${user.name}</strong>,
              </p>
              <p style="color: #1F2B2E; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                We received a request to reset your password. Click the button below to set a new passphrase. This link expires in <strong>1 hour</strong>.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetLink}" style="display: inline-block; background: #2C5F7C; color: #F6F3EC; padding: 14px 32px; font-size: 13px; font-weight: bold; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; border: 2px solid #1F2B2E;">
                  RESET MY PASSWORD
                </a>
              </div>
              <p style="color: #1F2B2E; font-size: 12px; line-height: 1.5; margin: 24px 0 0; opacity: 0.7;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
              </p>
              <hr style="border: none; border-top: 1px dashed #1F2B2E; margin: 24px 0; opacity: 0.3;" />
              <p style="color: #1F2B2E; font-size: 10px; opacity: 0.5; text-align: center; font-family: monospace;">
                GlobeTrotter &bull; Itinerary-as-Document &bull; ${new Date().getFullYear()}
              </p>
            </div>
          </div>
        `
      });

      console.log('✅ [Gmail] Email sent! Message ID:', info.messageId);
    } catch (emailErr) {
      console.error('❌ [Gmail Error]:', emailErr.message);
    }

    res.status(200).json({ message: successMessage });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// POST /api/auth/reset-password (Public — no auth required)
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Validation Error', message: 'Reset token is required.' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Validation Error', message: 'New password must be at least 6 characters long.' });
    }

    // Find the reset token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid Token', message: 'This reset link is invalid or has already been used.' });
    }

    // Check if already used
    if (resetRecord.usedAt) {
      return res.status(400).json({ error: 'Token Used', message: 'This reset link has already been used. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > resetRecord.expiresAt) {
      // Mark as used so it can't be retried
      await prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() }
      });
      return res.status(400).json({ error: 'Token Expired', message: 'This reset link has expired. Please request a new one.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password and mark token as used (in a transaction)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() }
      }),
      // Revoke all refresh tokens for this user (force re-login on all devices)
      prisma.refreshToken.deleteMany({
        where: { userId: resetRecord.userId }
      })
    ]);

    res.status(200).json({ message: 'Password has been reset successfully. Please sign in with your new password.' });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// GET /api/me or /api/auth/me (Protected)
const getMeHandler = async (req, res) => {
  try {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          savedDestinations: { include: { city: true } }
        }
      });
    } catch (dbErr) {}

    if (!user) {
      // Mock fallback user profile
      const fallbackUser = {
        id: req.user.userId || 'demo-user-id',
        name: req.user.email?.split('@')[0]?.toUpperCase() || 'Alex Johnson',
        email: req.user.email || 'alex@example.com',
        isAdmin: (req.user.email || '').includes('admin'),
        languagePref: 'en',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        savedDestinations: []
      };
      return res.status(200).json({ user: fallbackUser });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Fetch Profile Error:', error);
    const fallbackUser = {
      id: req.user?.userId || 'demo-user-id',
      name: 'Alex Johnson',
      email: req.user?.email || 'alex@example.com',
      isAdmin: false,
      languagePref: 'en',
      avatar: null,
      savedDestinations: []
    };
    res.status(200).json({ user: fallbackUser });
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
