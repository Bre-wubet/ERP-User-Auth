import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Multi-Factor Authentication utilities
 * Handles TOTP (Time-based One-Time Password) generation and verification
 */
class MFAUtils {
  constructor() {
    this.issuer = process.env.MFA_ISSUER || 'ERP System';
    this.algorithm = 'sha1';
    this.digits = 6;
    this.step = 30; // 30 seconds
  }

  
  generateSecret(userEmail, userName) {
    const secret = speakeasy.generateSecret({
      name: `${this.issuer} (${userEmail})`,
      account: userName,
      issuer: this.issuer,
      length: 32,
      algorithm: this.algorithm,
      digits: this.digits,
      step: this.step
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
      backupCodes: this.generateBackupCodes()
    };
  }

  
  async generateQRCode(otpauthUrl) {
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
  }

  
  verifyToken(token, secret, window = 1) {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window,
        algorithm: this.algorithm,
        digits: this.digits,
        step: this.step
      });
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  
  verifyBackupCode(code, validCodes) {
    if (!code || !validCodes || !Array.isArray(validCodes)) {
      return false;
    }

    const index = validCodes.findIndex(validCode => 
      validCode.toLowerCase() === code.toLowerCase()
    );

    return index !== -1;
  }

  
  removeUsedBackupCode(code, validCodes) {
    return validCodes.filter(validCode => 
      validCode.toLowerCase() !== code.toLowerCase()
    );
  }

  generateCurrentToken(secret) {
    try {
      return speakeasy.totp({
        secret,
        encoding: 'base32',
        algorithm: this.algorithm,
        digits: this.digits,
        step: this.step
      });
    } catch (error) {
      throw new Error(`Failed to generate current token: ${error.message}`);
    }
  }

  getTokenTimeRemaining() {
    const epoch = Math.round(new Date().getTime() / 1000.0);
    return this.step - (epoch % this.step);
  }

  validateSecret(secret) {
    if (!secret || typeof secret !== 'string') {
      return false;
    }

    // Check if it's a valid base32 string
    const base32Regex = /^[A-Z2-7]+=*$/;
    return base32Regex.test(secret.toUpperCase());
  }

  encryptSecret(secret, key) {
    const cipher = crypto.createCipher('aes-256-cbc', key);
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decryptSecret(encryptedSecret, key) {
    const decipher = crypto.createDecipher('aes-256-cbc', key);
    let decrypted = decipher.update(encryptedSecret, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Export singleton instance
export const mfaUtils = new MFAUtils();
export default mfaUtils;
