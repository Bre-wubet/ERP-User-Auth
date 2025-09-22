import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';
import { auditService } from '../services/auditService.js';
import { sendSuccessResponse, sendErrorResponse, asyncHandler } from '../middlewares/errorMiddleware.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication controller
 * Handles user authentication, registration, and password management
 */

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { email, password, firstName, lastName, roleId } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName,
      roleId,
      ip
    });

    // Log registration
    await auditService.logAuthEvent('user_registered', result.user.id, {
      email: result.user.email,
      roleId: result.user.roleId
    }, ip);

    sendSuccessResponse(res, 'User registered successfully', {
      user: result.user,
      tokens: result.tokens
    }, 201);
  } catch (error) {
    logger.error('Registration failed', { error: error.message, email, ip });
    sendErrorResponse(res, error.message, 400);
  }
});

export const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { email, password, mfaToken } = req.body;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');

  try {
    const result = await authService.login({
      email,
      password,
      mfaToken,
      ip,
      userAgent
    });

    // Check if MFA is required
    if (result.requiresMFA) {
      return sendSuccessResponse(res, 'MFA token required', {
        requiresMFA: true,
        userId: result.userId
      });
    }

    // Log successful login
    await auditService.logAuthEvent('user_logged_in', result.user.id, {
      email: result.user.email,
      sessionId: result.sessionId
    }, ip);

    sendSuccessResponse(res, 'Login successful', {
      user: result.user,
      tokens: result.tokens,
      sessionId: result.sessionId
    });
  } catch (error) {
    logger.error('Login failed', { error: error.message, email, ip });
    sendErrorResponse(res, error.message, 401);
  }
});

export const refreshToken = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { refreshToken } = req.body;

  try {
    const result = await authService.refreshToken(refreshToken);

    sendSuccessResponse(res, 'Token refreshed successfully', result);
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    sendErrorResponse(res, error.message, 401);
  }
});

export const logout = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user.id;

  try {
    await authService.logout(userId, sessionId);

    // Log logout
    await auditService.logAuthEvent('user_logged_out', userId, {
      sessionId
    }, req.ip);

    sendSuccessResponse(res, 'Logout successful');
  } catch (error) {
    logger.error('Logout failed', { error: error.message, userId, sessionId });
    sendErrorResponse(res, error.message, 500);
  }
});

export const logoutAll = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    await authService.logoutAll(userId);

    // Log logout all
    await auditService.logAuthEvent('user_logged_out_all', userId, {}, req.ip);

    sendSuccessResponse(res, 'Logged out from all sessions');
  } catch (error) {
    logger.error('Logout all failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 500);
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    await authService.changePassword(userId, currentPassword, newPassword);

    // Log password change
    await auditService.logAuthEvent('password_changed', userId, {}, req.ip);

    sendSuccessResponse(res, 'Password changed successfully');
  } catch (error) {
    logger.error('Password change failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

export const initiatePasswordReset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { email } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    const message = await authService.initiatePasswordReset(email);

    // Log password reset initiation
    await auditService.logAuthEvent('password_reset_initiated', null, {
      email,
      ip
    }, ip);

    sendSuccessResponse(res, message);
  } catch (error) {
    logger.error('Password reset initiation failed', { error: error.message, email, ip });
    sendErrorResponse(res, error.message, 500);
  }
});

export const completePasswordReset = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { resetToken, newPassword } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  try {
    await authService.completePasswordReset(resetToken, newPassword);

    // Log password reset completion
    await auditService.logAuthEvent('password_reset_completed', null, {
      resetToken,
      ip
    }, ip);

    sendSuccessResponse(res, 'Password reset successfully');
  } catch (error) {
    logger.error('Password reset completion failed', { error: error.message, ip });
    sendErrorResponse(res, error.message, 400);
  }
});

export const setupMFA = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const mfaData = await authService.setupMFA(userId);

    // Log MFA setup initiation
    await auditService.logAuthEvent('mfa_setup_initiated', userId, {}, req.ip);

    sendSuccessResponse(res, 'MFA setup data generated', mfaData);
  } catch (error) {
    logger.error('MFA setup failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 500);
  }
});

export const enableMFA = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { token, secret } = req.body;
  const userId = req.user.id;

  try {
    await authService.enableMFA(userId, token, secret);

    // Log MFA enablement
    await auditService.logAuthEvent('mfa_enabled', userId, {}, req.ip);

    sendSuccessResponse(res, 'MFA enabled successfully');
  } catch (error) {
    logger.error('MFA enable failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

export const disableMFA = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { token } = req.body;
  const userId = req.user.id;

  try {
    await authService.disableMFA(userId, token);

    // Log MFA disablement
    await auditService.logAuthEvent('mfa_disabled', userId, {}, req.ip);

    sendSuccessResponse(res, 'MFA disabled successfully');
  } catch (error) {
    logger.error('MFA disable failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await userService.getUserById(userId);
    sendSuccessResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    logger.error('Get profile failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 500);
  }
});

export const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { firstName, lastName } = req.body;
  const userId = req.user.id;

  try {
    const user = await userService.updateUser(userId, { firstName, lastName });

    // Log profile update
    await auditService.logAuthEvent('profile_updated', userId, {
      changes: { firstName, lastName }
    }, req.ip);

    sendSuccessResponse(res, 'Profile updated successfully', user);
  } catch (error) {
    logger.error('Profile update failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 'Validation failed', 400, { errors: errors.array() });
  }

  const { token } = req.body;

  try {
    await authService.verifyEmail(token);
    sendSuccessResponse(res, 'Email verified successfully');
  } catch (error) {
    logger.error('Email verification failed', { error: error.message });
    sendErrorResponse(res, error.message, 400);
  }
});

export const resendEmailVerification = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  try {
    await authService.resendEmailVerification(userId);
    sendSuccessResponse(res, 'Verification email sent successfully');
  } catch (error) {
    logger.error('Resend email verification failed', { error: error.message, userId });
    sendErrorResponse(res, error.message, 400);
  }
});

export const cleanupExpiredTokens = asyncHandler(async (req, res) => {
  try {
    await authService.cleanupExpiredResetTokens();
    sendSuccessResponse(res, 'Expired tokens cleaned up successfully');
  } catch (error) {
    logger.error('Token cleanup failed', { error: error.message });
    sendErrorResponse(res, error.message, 500);
  }
});

// Validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('roleId')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Role ID must be provided')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('mfaToken')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('MFA token must be 6 digits')
];

export const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export const passwordResetValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

export const completePasswordResetValidation = [
  body('resetToken')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

export const mfaValidation = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('MFA token must be 6 digits'),
  body('secret')
    .optional()
    .isLength({ min: 32 })
    .withMessage('MFA secret must be at least 32 characters')
];

export const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
];

export const emailVerificationValidation = [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
];
