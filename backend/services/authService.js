import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from '../config/db.js';
import { jwtUtils } from '../utils/jwtUtils.js';
import { mfaUtils } from '../utils/mfaUtils.js';
import { logger } from '../utils/logger.js';
import { emailService } from './emailService.js';

/**
 * Authentication service
 * Handles user authentication, registration, password management, and MFA
 */
class AuthService {
  constructor() {
    this.saltRounds = 12;
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user and tokens
   */
  async register(userData) {
    const { email, password, firstName, lastName, roleId } = userData;

    try {
      // Check if user already exists
      const existingUser = await db.client.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Get default role if no roleId provided
      let finalRoleId = roleId;
      if (!finalRoleId) {
        const defaultRole = await db.client.role.findFirst({
          where: { name: 'user' } // Default role name
        });
        
        if (!defaultRole) {
          throw new Error('Default role not found. Please contact administrator.');
        }
        
        finalRoleId = defaultRole.id;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.saltRounds);

      // Create user
      const user = await db.client.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          roleId: finalRoleId,
          isActive: true,
          emailVerified: false
        },
        include: {
          role: true
        }
      });

      // Generate tokens
      const tokens = jwtUtils.generateTokenPair(user);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`);
      } catch (emailError) {
        logger.warn('Failed to send welcome email', { 
          error: emailError.message, 
          userId: user.id 
        });
      }

      // Log registration
      logger.auth('user_registered', user, { ip: userData.ip });

      return {
        user: this.sanitizeUser(user),
        tokens
      };
    } catch (error) {
      logger.error('User registration failed', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User and tokens
   */
  async login(credentials) {
    const { email, password, mfaToken, ip, userAgent } = credentials;

    try {
      // Find user
      const user = await db.client.user.findUnique({
        where: { email: email.toLowerCase() },
        include: { role: true }
      });

      if (!user) {
        logger.security('login_failed_user_not_found', { email, ip });
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        logger.security('login_failed_inactive_user', { userId: user.id, email, ip });
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.security('login_failed_invalid_password', { userId: user.id, email, ip });
        throw new Error('Invalid credentials');
      }

      // Check MFA if enabled
      if (user.mfaSecret) {
        if (!mfaToken) {
          // Return MFA required response
          return {
            requiresMFA: true,
            userId: user.id,
            message: 'MFA token required'
          };
        }

        const isMfaValid = mfaUtils.verifyToken(mfaToken, user.mfaSecret);
        if (!isMfaValid) {
          logger.security('login_failed_invalid_mfa', { userId: user.id, email, ip });
          throw new Error('Invalid MFA token');
        }
      }

      // Update last login
      await db.client.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Create session
      const session = await this.createSession(user.id, ip, userAgent);

      // Generate tokens
      const tokens = jwtUtils.generateTokenPair(user);

      // Log successful login
      logger.auth('user_logged_in', user, { ip, userAgent, sessionId: session.id });

      return {
        user: this.sanitizeUser(user),
        tokens,
        sessionId: session.id
      };
    } catch (error) {
      logger.error('User login failed', { error: error.message, email, ip });
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New access token
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwtUtils.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await db.client.user.findUnique({
        where: { id: decoded.userId },
        include: { role: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new access token
      const newAccessToken = jwtUtils.generateAccessToken(user);

      logger.auth('token_refreshed', user);

      return {
        accessToken: newAccessToken,
        expiresIn: jwtUtils.accessTokenExpiry
      };
    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @returns {Promise<void>}
   */
  async logout(userId, sessionId) {
    try {
      // Delete session
      await db.client.session.delete({
        where: { id: sessionId }
      });

      logger.auth('user_logged_out', { id: userId }, { sessionId });
    } catch (error) {
      logger.error('Logout failed', { error: error.message, userId, sessionId });
      throw error;
    }
  }

  /**
   * Logout all sessions for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async logoutAll(userId) {
    try {
      // Delete all user sessions
      await db.client.session.deleteMany({
        where: { userId }
      });

      logger.auth('user_logged_out_all', { id: userId });
    } catch (error) {
      logger.error('Logout all failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update password
      await db.client.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      // Logout all sessions for security
      await this.logoutAll(userId);

      logger.auth('password_changed', user);
    } catch (error) {
      logger.error('Password change failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Reset password (forgot password flow)
   * @param {string} email - User email
   * @returns {Promise<string>} Success message
   */
  async initiatePasswordReset(email) {
    try {
      const user = await db.client.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if user exists for security
        return 'If an account with that email exists, a password reset link has been sent';
      }

      if (!user.isActive) {
        // Don't reveal if user is inactive
        return 'If an account with that email exists, a password reset link has been sent';
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store reset token in database
      await db.client.passwordResetToken.create({
        data: {
          userId: user.id,
          token: resetToken,
          expiresAt: resetExpiry
        }
      });

      // Send password reset email
      try {
        await emailService.sendPasswordResetEmail(
          user.email, 
          resetToken, 
          `${user.firstName} ${user.lastName}`
        );
      } catch (emailError) {
        logger.error('Failed to send password reset email', { 
          error: emailError.message, 
          userId: user.id 
        });
        throw new Error('Failed to send password reset email');
      }

      logger.auth('password_reset_initiated', user);

      return 'If an account with that email exists, a password reset link has been sent';
    } catch (error) {
      logger.error('Password reset initiation failed', { error: error.message, email });
      throw error;
    }
  }

  /**
   * Complete password reset
   * @param {string} resetToken - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<void>}
   */
  async completePasswordReset(resetToken, newPassword) {
    try {
      // Find valid reset token
      const resetTokenRecord = await db.client.passwordResetToken.findUnique({
        where: { token: resetToken },
        include: { user: true }
      });

      if (!resetTokenRecord) {
        throw new Error('Invalid or expired reset token');
      }

      if (resetTokenRecord.used) {
        throw new Error('Reset token has already been used');
      }

      if (resetTokenRecord.expiresAt < new Date()) {
        // Clean up expired token
        await db.client.passwordResetToken.delete({
          where: { id: resetTokenRecord.id }
        });
        throw new Error('Reset token has expired');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // Update user password
      await db.client.user.update({
        where: { id: resetTokenRecord.userId },
        data: { password: hashedPassword }
      });

      // Mark reset token as used
      await db.client.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { used: true }
      });

      // Logout all sessions for security
      await this.logoutAll(resetTokenRecord.userId);

      // Send security alert email
      try {
        await emailService.sendSecurityAlertEmail(
          resetTokenRecord.user.email,
          `${resetTokenRecord.user.firstName} ${resetTokenRecord.user.lastName}`,
          'Password Reset Completed',
          {
            timestamp: new Date().toISOString(),
            ip: 'Unknown' // Could be passed from controller
          }
        );
      } catch (emailError) {
        logger.warn('Failed to send security alert email', { 
          error: emailError.message, 
          userId: resetTokenRecord.userId 
        });
      }

      logger.auth('password_reset_completed', resetTokenRecord.user);

      // Clean up old reset tokens for this user
      await db.client.passwordResetToken.deleteMany({
        where: {
          userId: resetTokenRecord.userId,
          used: true
        }
      });
    } catch (error) {
      logger.error('Password reset completion failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup MFA for user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} MFA setup data
   */
  async setupMFA(userId) {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate MFA secret
      const mfaData = mfaUtils.generateSecret(user.email, `${user.firstName} ${user.lastName}`);
      
      // Generate QR code
      const qrCodeUrl = await mfaUtils.generateQRCode(mfaData.qrCodeUrl);

      return {
        secret: mfaData.secret,
        qrCodeUrl,
        backupCodes: mfaData.backupCodes
      };
    } catch (error) {
      logger.error('MFA setup failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Enable MFA for user
   * @param {string} userId - User ID
   * @param {string} token - MFA token to verify
   * @param {string} secret - MFA secret
   * @returns {Promise<void>}
   */
  async enableMFA(userId, token, secret) {
    try {
      // Verify token
      const isTokenValid = mfaUtils.verifyToken(token, secret);
      if (!isTokenValid) {
        throw new Error('Invalid MFA token');
      }

      // Update user with MFA secret
      await db.client.user.update({
        where: { id: userId },
        data: { mfaSecret: secret }
      });

      // Send MFA setup confirmation email
      try {
        const user = await db.client.user.findUnique({
          where: { id: userId }
        });
        
        if (user) {
          await emailService.sendMFASetupEmail(
            user.email,
            `${user.firstName} ${user.lastName}`
          );
        }
      } catch (emailError) {
        logger.warn('Failed to send MFA setup email', { 
          error: emailError.message, 
          userId 
        });
      }

      logger.auth('mfa_enabled', { id: userId });
    } catch (error) {
      logger.error('MFA enable failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Disable MFA for user
   * @param {string} userId - User ID
   * @param {string} token - MFA token to verify
   * @returns {Promise<void>}
   */
  async disableMFA(userId, token) {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.mfaSecret) {
        throw new Error('MFA not enabled');
      }

      // Verify token
      const isTokenValid = mfaUtils.verifyToken(token, user.mfaSecret);
      if (!isTokenValid) {
        throw new Error('Invalid MFA token');
      }

      // Remove MFA secret
      await db.client.user.update({
        where: { id: userId },
        data: { mfaSecret: null }
      });

      logger.auth('mfa_disabled', user);
    } catch (error) {
      logger.error('MFA disable failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Create user session
   * @param {string} userId - User ID
   * @param {string} ip - IP address
   * @param {string} userAgent - User agent
   * @returns {Promise<Object>} Created session
   */
  async createSession(userId, ip, userAgent) {
    try {
      const sessionToken = jwtUtils.generateSecureToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const session = await db.client.session.create({
        data: {
          userId,
          token: sessionToken,
          ip,
          userAgent,
          expiresAt
        }
      });

      return session;
    } catch (error) {
      logger.error('Session creation failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Verify session
   * @param {string} sessionToken - Session token
   * @returns {Promise<Object>} Session data
   */
  async verifySession(sessionToken) {
    try {
      const session = await db.client.session.findUnique({
        where: { token: sessionToken },
        include: { user: { include: { role: true } } }
      });

      if (!session) {
        throw new Error('Invalid session');
      }

      if (session.expiresAt < new Date()) {
        // Delete expired session
        await db.client.session.delete({
          where: { id: session.id }
        });
        throw new Error('Session expired');
      }

      return session;
    } catch (error) {
      logger.error('Session verification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Verify email address
   * @param {string} verificationToken - Email verification token
   * @returns {Promise<void>}
   */
  async verifyEmail(verificationToken) {
    try {
      // In a real implementation, you'd have email verification tokens
      // For now, we'll simulate the process
      const decoded = jwtUtils.verifyToken(verificationToken);
      
      const user = await db.client.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Update user email verification status
      await db.client.user.update({
        where: { id: user.id },
        data: { emailVerified: true }
      });

      logger.auth('email_verified', user);
    } catch (error) {
      logger.error('Email verification failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Resend email verification
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async resendEmailVerification(userId) {
    try {
      const user = await db.client.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.emailVerified) {
        throw new Error('Email is already verified');
      }

      // Generate verification token
      const verificationToken = jwtUtils.generateToken({ userId: user.id }, '1h');

      // Send verification email
      try {
        await emailService.sendAccountActivationEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          verificationToken
        );
      } catch (emailError) {
        logger.error('Failed to send verification email', { 
          error: emailError.message, 
          userId 
        });
        throw new Error('Failed to send verification email');
      }

      logger.auth('email_verification_resent', user);
    } catch (error) {
      logger.error('Resend email verification failed', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Clean up expired password reset tokens
   * @returns {Promise<void>}
   */
  async cleanupExpiredResetTokens() {
    try {
      const result = await db.client.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      logger.info('Cleaned up expired password reset tokens', { 
        count: result.count 
      });
    } catch (error) {
      logger.error('Failed to cleanup expired reset tokens', { 
        error: error.message 
      });
    }
  }

  /**
   * Sanitize user data (remove sensitive information)
   * @param {Object} user - User object
   * @returns {Object} Sanitized user object
   */
  sanitizeUser(user) {
    const { password, mfaSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
