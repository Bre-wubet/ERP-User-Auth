import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { jwtUtils } from '../utils/jwtUtils.js';
import { mfaUtils } from '../utils/mfaUtils.js';
import { logger } from '../utils/logger.js';

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
          isActive: true
        },
        include: {
          role: true
        }
      });

      // Generate tokens
      const tokens = jwtUtils.generateTokenPair(user);

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
   * @returns {Promise<string>} Reset token
   */
  async initiatePasswordReset(email) {
    try {
      const user = await db.client.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        // Don't reveal if user exists
        return 'Password reset email sent';
      }

      // Generate reset token
      const resetToken = jwtUtils.generateSecureToken();
      const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store reset token (you might want to create a separate table for this)
      // For now, we'll use a simple approach
      const resetData = {
        token: resetToken,
        expiresAt: resetExpiry,
        userId: user.id
      };

      // In a real implementation, you'd store this in a database table
      // and send an email with the reset link

      logger.auth('password_reset_initiated', user);

      return 'Password reset email sent';
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
      // In a real implementation, you'd verify the reset token from the database
      // For now, we'll simulate the process

      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);

      // You would update the user's password here
      // await db.client.user.update({...});

      logger.auth('password_reset_completed', { resetToken });

      // Logout all sessions
      // await this.logoutAll(userId);
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
