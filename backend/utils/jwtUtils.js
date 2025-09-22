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

  generateTokenPair(user) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: this.accessTokenExpiry
    };
  }

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

  decodeToken(token) {
    return jwt.decode(token);
  }

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

  extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }
}

// Export singleton instance
export const jwtUtils = new JWTUtils();
export default jwtUtils;
