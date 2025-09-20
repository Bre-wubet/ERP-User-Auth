import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import { db } from './db.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

/**
 * Passport configuration
 * Handles authentication strategies for the ERP system
 */

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  issuer: 'erp-system',
  audience: 'erp-users'
}, async (payload, done) => {
  try {
    const user = await db.client.user.findUnique({
      where: { id: payload.userId },
      include: { role: true }
    });

    if (!user) {
      return done(null, false);
    }

    if (!user.isActive) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    logger.error('JWT strategy error', { error: error.message, payload });
    return done(error, false);
  }
}));

// Local Strategy (for username/password authentication)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await db.client.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { role: true }
    });

    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return done(null, false, { message: 'Account is deactivated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    return done(null, user);
  } catch (error) {
    logger.error('Local strategy error', { error: error.message, email });
    return done(error, false);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.client.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    logger.error('Deserialize user error', { error: error.message, userId: id });
    return done(error, false);
  }
});

export default passport;
