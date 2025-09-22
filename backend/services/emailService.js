import 'dotenv/config';
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/**
 * Email Service
 * Handles all email operations including password reset, notifications, etc.
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      // Create transporter based on environment configuration
      const emailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // For development/testing
        },
      };
      console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS exists:", !!process.env.SMTP_PASS);


      this.transporter = nodemailer.createTransport(emailConfig);

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          logger.error('Email service initialization failed', { error: error.message });
        } else {
          logger.info('Email service initialized successfully');
        }
      });
    } catch (error) {
      logger.error('Failed to initialize email service', { error: error.message });
    }
  }

  async sendPasswordResetEmail(email, resetToken, userName) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: {
          name: process.env.SMTP_FROM || 'ERP Security System',
          address: process.env.SMTP_USER,
        },
        to: email,
        subject: 'Password Reset Request - ERP Security System',
        html: this.getPasswordResetTemplate(userName, resetUrl),
        text: this.getPasswordResetTextTemplate(userName, resetUrl),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Password reset email sent', { 
        email, 
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send password reset email', { 
        error: error.message, 
        email 
      });
      return false;
    }
  }

  async sendWelcomeEmail(email, userName, tempPassword = null) {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'ERP Security System',
          address: process.env.SMTP_USER,
        },
        to: email,
        subject: 'Welcome to ERP Security System',
        html: this.getWelcomeTemplate(userName, tempPassword),
        text: this.getWelcomeTextTemplate(userName, tempPassword),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Welcome email sent', { 
        email, 
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send welcome email', { 
        error: error.message, 
        email 
      });
      return false;
    }
  }

  async sendAccountActivationEmail(email, userName, activationToken) {
    try {
      const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/activate-account?token=${activationToken}`;
      
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'ERP Security System',
          address: process.env.SMTP_USER,
        },
        to: email,
        subject: 'Activate Your Account - ERP Security System',
        html: this.getAccountActivationTemplate(userName, activationUrl),
        text: this.getAccountActivationTextTemplate(userName, activationUrl),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Account activation email sent', { 
        email, 
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send account activation email', { 
        error: error.message, 
        email 
      });
      return false;
    }
  }

  async sendSecurityAlertEmail(email, userName, alertType, details) {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'ERP Security System',
          address: process.env.SMTP_USER,
        },
        to: email,
        subject: `Security Alert: ${alertType} - ERP Security System`,
        html: this.getSecurityAlertTemplate(userName, alertType, details),
        text: this.getSecurityAlertTextTemplate(userName, alertType, details),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Security alert email sent', { 
        email, 
        alertType,
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send security alert email', { 
        error: error.message, 
        email,
        alertType 
      });
      return false;
    }
  }

  async sendMFASetupEmail(email, userName) {
    try {
      const mailOptions = {
        from: {
          name: process.env.EMAIL_FROM_NAME || 'ERP Security System',
          address: process.env.SMTP_USER,
        },
        to: email,
        subject: 'MFA Setup Complete - ERP Security System',
        html: this.getMFASetupTemplate(userName),
        text: this.getMFASetupTextTemplate(userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('MFA setup email sent', { 
        email, 
        messageId: result.messageId 
      });
      
      return true;
    } catch (error) {
      logger.error('Failed to send MFA setup email', { 
        error: error.message, 
        email 
      });
      return false;
    }
  }

  /**
   * Get password reset HTML template
   */
  getPasswordResetTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>We received a request to reset your password for your ERP Security System account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 15 minutes</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
          </div>
          <div class="footer">
            <p>This email was sent from ERP Security System. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get password reset text template
   */
  getPasswordResetTextTemplate(userName, resetUrl) {
    return `
Password Reset Request - ERP Security System

Hello ${userName},

We received a request to reset your password for your ERP Security System account.

To reset your password, please visit the following link:
${resetUrl}

Security Notice:
- This link will expire in 15 minutes
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you have any questions, please contact our support team.

Best regards,
ERP Security System Team
    `;
  }

  /**
   * Get welcome HTML template
   */
  getWelcomeTemplate(userName, tempPassword = null) {
    const tempPasswordSection = tempPassword ? `
      <div class="warning">
        <strong>Temporary Password:</strong>
        <p style="font-family: monospace; background: #f3f4f6; padding: 10px; border-radius: 4px;">${tempPassword}</p>
        <p>Please change this password after your first login.</p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ERP Security System</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Welcome to the ERP Security System! Your account has been successfully created.</p>
            ${tempPasswordSection}
            <p>You can now access the system using your credentials. We recommend setting up two-factor authentication for enhanced security.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent from ERP Security System. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get welcome text template
   */
  getWelcomeTextTemplate(userName, tempPassword = null) {
    const tempPasswordSection = tempPassword ? `
Temporary Password: ${tempPassword}
Please change this password after your first login.
    ` : '';

    return `
Welcome to ERP Security System

Hello ${userName},

Welcome to the ERP Security System! Your account has been successfully created.

${tempPasswordSection}

You can now access the system using your credentials. We recommend setting up two-factor authentication for enhanced security.

If you have any questions or need assistance, please don't hesitate to contact our support team.

Best regards,
ERP Security System Team
    `;
  }

  /**
   * Get account activation HTML template
   */
  getAccountActivationTemplate(userName, activationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Activation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Activate Your Account</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for registering with ERP Security System. To complete your registration, please activate your account by clicking the button below:</p>
            <a href="${activationUrl}" class="button">Activate Account</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #059669;">${activationUrl}</p>
          </div>
          <div class="footer">
            <p>This email was sent from ERP Security System. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get account activation text template
   */
  getAccountActivationTextTemplate(userName, activationUrl) {
    return `
Account Activation - ERP Security System

Hello ${userName},

Thank you for registering with ERP Security System. To complete your registration, please activate your account by visiting the following link:

${activationUrl}

Best regards,
ERP Security System Team
    `;
  }

  /**
   * Get security alert HTML template
   */
  getSecurityAlertTemplate(userName, alertType, details) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Security Alert</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .alert { background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Security Alert</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <div class="alert">
              <h3>Security Alert: ${alertType}</h3>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Details:</strong> ${JSON.stringify(details, null, 2)}</p>
            </div>
            <p>If you did not perform this action, please contact our security team immediately and change your password.</p>
          </div>
          <div class="footer">
            <p>This email was sent from ERP Security System. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get security alert text template
   */
  getSecurityAlertTextTemplate(userName, alertType, details) {
    return `
Security Alert - ERP Security System

Hello ${userName},

Security Alert: ${alertType}

Time: ${new Date().toLocaleString()}
Details: ${JSON.stringify(details, null, 2)}

If you did not perform this action, please contact our security team immediately and change your password.

Best regards,
ERP Security System Team
    `;
  }

  /**
   * Get MFA setup HTML template
   */
  getMFASetupTemplate(userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MFA Setup Complete</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MFA Setup Complete</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Your two-factor authentication (MFA) has been successfully set up for your ERP Security System account.</p>
            <p>Your account is now protected with an additional layer of security. You will need to provide your MFA code when logging in.</p>
            <p>If you have any questions or need assistance, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent from ERP Security System. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get MFA setup text template
   */
  getMFASetupTextTemplate(userName) {
    return `
MFA Setup Complete - ERP Security System

Hello ${userName},

Your two-factor authentication (MFA) has been successfully set up for your ERP Security System account.

Your account is now protected with an additional layer of security. You will need to provide your MFA code when logging in.

If you have any questions or need assistance, please contact our support team.

Best regards,
ERP Security System Team
    `;
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;
