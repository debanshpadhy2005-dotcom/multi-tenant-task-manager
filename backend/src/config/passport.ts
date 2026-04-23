import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../repositories/user.repository';
import { logger } from '../utils/logger';

const userRepository = new UserRepository();

/**
 * JWT Strategy Configuration
 * Used for protecting API routes
 */
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET || 'your_jwt_secret',
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await userRepository.findById(payload.userId, payload.tenantId);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      logger.error('JWT Strategy Error:', error);
      return done(error, false);
    }
  })
);

/**
 * Google OAuth Strategy Configuration
 * Used for social authentication
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Find or create user based on Google profile
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'), false);
          }

          let user = await userRepository.findByEmail(email);
          
          if (!user) {
            // Create new user from Google profile
            // Note: This is a simplified version. In production, you'd handle tenant assignment differently
            user = await userRepository.create({
              email,
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              password: '', // No password for OAuth users
              tenantId: '', // Will be set during organization creation
              roleId: '', // Will be set based on organization
              isOAuthUser: true,
              oauthProvider: 'google',
              oauthId: profile.id,
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google Strategy Error:', error);
          return done(error as Error, false);
        }
      }
    )
  );
}

export default passport;
