import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Multi-Factor Authentication utilities
 * Handles TOTP (Time-based One-Time Password) generation and verification
 */

// Configuration constants
const ISSUER = process.env.MFA_ISSUER || 'ERP System';
const ALGORITHM = 'sha1';
const DIGITS = 6;
const STEP = 30; // 30 seconds

  
export const generateSecret = (userEmail, userName) => {
  const secret = speakeasy.generateSecret({
    name: `${ISSUER} (${userEmail})`,
    account: userName,
    issuer: ISSUER,
    length: 32,
    algorithm: ALGORITHM,
    digits: DIGITS,
    step: STEP
  });

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url,
    backupCodes: generateBackupCodes()
  };
};

  
export const generateQRCode = async (otpauthUrl) => {
  try {
    return await QRCode.toDataURL(otpauthUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error.message}`);
  }
};

  
export const verifyToken = (token, secret, window = 1) => {
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window,
      algorithm: ALGORITHM,
      digits: DIGITS,
      step: STEP
    });
  } catch (error) {
    console.error('MFA verification error:', error);
    return false;
  }
};

  
export const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
  }
  return codes;
};

  
export const verifyBackupCode = (code, validCodes) => {
  if (!code || !validCodes || !Array.isArray(validCodes)) {
    return false;
  }

  const index = validCodes.findIndex(validCode => 
    validCode.toLowerCase() === code.toLowerCase()
  );

  return index !== -1;
};

  
export const removeUsedBackupCode = (code, validCodes) => {
  return validCodes.filter(validCode => 
    validCode.toLowerCase() !== code.toLowerCase()
  );
};

export const generateCurrentToken = (secret) => {
  try {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
      algorithm: ALGORITHM,
      digits: DIGITS,
      step: STEP
    });
  } catch (error) {
    throw new Error(`Failed to generate current token: ${error.message}`);
  }
};

export const getTokenTimeRemaining = () => {
  const epoch = Math.round(new Date().getTime() / 1000.0);
  return STEP - (epoch % STEP);
};

export const validateSecret = (secret) => {
  if (!secret || typeof secret !== 'string') {
    return false;
  }

  // Check if it's a valid base32 string
  const base32Regex = /^[A-Z2-7]+=*$/;
  return base32Regex.test(secret.toUpperCase());
};

export const encryptSecret = (secret, key) => {
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

export const decryptSecret = (encryptedSecret, key) => {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
// Export all functions as named exports
export default {
  generateSecret,
  generateQRCode,
  verifyToken,
  generateBackupCodes,
  verifyBackupCode,
  removeUsedBackupCode,
  generateCurrentToken,
  getTokenTimeRemaining,
  validateSecret,
  encryptSecret,
  decryptSecret
};
