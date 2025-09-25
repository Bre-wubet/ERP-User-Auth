import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWT utility functions for token generation, verification, and management
 */

// Configuration constants
const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export const generateAccessToken = (payload) => {
  const tokenPayload = {
    userId: payload.id,
    email: payload.email,
    roleId: payload.roleId,
    roleName: payload.role?.name || null,
    type: 'access'
  };

  return jwt.sign(tokenPayload, SECRET_KEY, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'erp-system',
    audience: 'erp-users'
  });
};

export const generateRefreshToken = (payload) => {
  const tokenPayload = {
    userId: payload.id,
    email: payload.email,
    type: 'refresh'
  };

  return jwt.sign(tokenPayload, REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'erp-system',
    audience: 'erp-users'
  });
};

export const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
    expiresIn: ACCESS_TOKEN_EXPIRY
  };
};

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY, {
      issuer: 'erp-system',
      audience: 'erp-users'
    });
  } catch (error) {
    throw new Error(`Invalid access token: ${error.message}`);
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET_KEY, {
      issuer: 'erp-system',
      audience: 'erp-users'
    });
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
};

export const generateApiToken = (payload, expiresIn = '1y') => {
  const tokenPayload = {
    ...payload,
    type: 'api',
    jti: crypto.randomUUID() // JWT ID for tracking
  };

  return jwt.sign(tokenPayload, SECRET_KEY, {
    expiresIn,
    issuer: 'erp-system',
    audience: 'erp-services'
  });
};

export const verifyApiToken = (token) => {
  try {
    return jwt.verify(token, SECRET_KEY, {
      issuer: 'erp-system',
      audience: 'erp-services'
    });
  } catch (error) {
    throw new Error(`Invalid API token: ${error.message}`);
  }
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  
  return parts[1];
};

export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
// Export all functions as named exports
export default {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  generateApiToken,
  verifyApiToken,
  decodeToken,
  isTokenExpired,
  extractTokenFromHeader,
  generateSecureToken
};
