import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWT utility functions for token generation, verification, and management
 */
class JWTUtils {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    this.refreshSecretKey = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
  }

  /**
   * Generate access token
   * @param {Object} payload - User data to encode
   * @returns {string} Access token
   */
  generateAccessToken(payload) {
    const tokenPayload = {
      userId: payload.id,
      email: payload.email,
      roleId: payload.roleId,
      roleName: payload.role?.name || null,
      type: 'access'
    };

    return jwt.sign(tokenPayload, this.secretKey, {
      expiresIn: this.accessTokenExpiry,
      issuer: 'erp-system',
      audience: 'erp-users'
    });
  }

  /**
   * Generate refresh token
   * @param {Object} payload - User data to encode
   * @returns {string} Refresh token
   */
  generateRefreshToken(payload) {
    const tokenPayload = {
      userId: payload.id,
      email: payload.email,
      type: 'refresh'
    };

    return jwt.sign(tokenPayload, this.refreshSecretKey, {
      expiresIn: this.refreshTokenExpiry,
      issuer: 'erp-system',
      audience: 'erp-users'
    });
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing access and refresh tokens
   */
  generateTokenPair(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: this.accessTokenExpiry
    };
  }

  /**
   * Verify access token
   * @param {string} token - Access token to verify
   * @returns {Object} Decoded token payload
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secretKey, {
        issuer: 'erp-system',
        audience: 'erp-users'
      });
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  /**
   * Verify refresh token
   * @param {string} token - Refresh token to verify
   * @returns {Object} Decoded token payload
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecretKey, {
        issuer: 'erp-system',
        audience: 'erp-users'
      });
    } catch (error) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Generate API token for service-to-service communication
   * @param {Object} payload - Token payload
   * @param {string} expiresIn - Token expiry (optional)
   * @returns {string} API token
   */
  generateApiToken(payload, expiresIn = '1y') {
    const tokenPayload = {
      ...payload,
      type: 'api',
      jti: crypto.randomUUID() // JWT ID for tracking
    };

    return jwt.sign(tokenPayload, this.secretKey, {
      expiresIn,
      issuer: 'erp-system',
      audience: 'erp-services'
    });
  }

  /**
   * Verify API token
   * @param {string} token - API token to verify
   * @returns {Object} Decoded token payload
   */
  verifyApiToken(token) {
    try {
      return jwt.verify(token, this.secretKey, {
        issuer: 'erp-system',
        audience: 'erp-services'
      });
    } catch (error) {
      throw new Error(`Invalid API token: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for debugging)
   * @param {string} token - Token to decode
   * @returns {Object} Decoded token payload
   */
  decodeToken(token) {
    return jwt.decode(token);
  }

  /**
   * Check if token is expired
   * @param {string} token - Token to check
   * @returns {boolean} True if expired
   */
  isTokenExpired(token) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  /**
   * Generate secure random token for password reset, email verification, etc.
   * @param {number} length - Token length (default: 32)
   * @returns {string} Random token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Export singleton instance
export const jwtUtils = new JWTUtils();
export default jwtUtils;
