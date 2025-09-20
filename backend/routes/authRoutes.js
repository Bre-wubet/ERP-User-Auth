import express from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  changePassword,
  initiatePasswordReset,
  completePasswordReset,
  setupMFA,
  enableMFA,
  disableMFA,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
  refreshTokenValidation,
  changePasswordValidation,
  passwordResetValidation,
  completePasswordResetValidation,
  mfaValidation,
  updateProfileValidation
} from '../controllers/authController.js';
import { verifyToken, authRateLimit, logAuthAttempt } from '../middlewares/authMiddleware.js';
import { auditAuth } from '../middlewares/auditMiddleware.js';

const router = express.Router();

/**
 * Authentication routes
 * Handles user authentication, registration, and password management
 */

// Public routes (no authentication required)
router.post('/register', 
  authRateLimit,
  registerValidation,
  auditAuth('register'),
  register
);

router.post('/login', 
  authRateLimit,
  loginValidation,
  auditAuth('login'),
  logAuthAttempt,
  login
);

router.post('/refresh-token', 
  refreshTokenValidation,
  refreshToken
);

router.post('/password-reset/initiate', 
  authRateLimit,
  passwordResetValidation,
  auditAuth('password_reset_initiate'),
  initiatePasswordReset
);

router.post('/password-reset/complete', 
  authRateLimit,
  completePasswordResetValidation,
  auditAuth('password_reset_complete'),
  completePasswordReset
);

// Protected routes (authentication required)
router.post('/logout', 
  verifyToken,
  auditAuth('logout'),
  logout
);

router.post('/logout-all', 
  verifyToken,
  auditAuth('logout_all'),
  logoutAll
);

router.post('/change-password', 
  verifyToken,
  changePasswordValidation,
  auditAuth('change_password'),
  changePassword
);

router.get('/profile', 
  verifyToken,
  getProfile
);

router.put('/profile', 
  verifyToken,
  updateProfileValidation,
  auditAuth('profile_update'),
  updateProfile
);

// MFA routes
router.post('/mfa/setup', 
  verifyToken,
  auditAuth('mfa_setup'),
  setupMFA
);

router.post('/mfa/enable', 
  verifyToken,
  mfaValidation,
  auditAuth('mfa_enable'),
  enableMFA
);

router.post('/mfa/disable', 
  verifyToken,
  mfaValidation,
  auditAuth('mfa_disable'),
  disableMFA
);

export default router;
