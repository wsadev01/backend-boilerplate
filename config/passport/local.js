
/* jshint esversion: 6 */

/**
 * Requires
 */
const mongoose      = require('mongoose');
const bcrypt        = require('bcryptjs');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const ExtractJWT    = require('passport-jwt').ExtractJwt;
const JwtStrategy   = require('passport-jwt').Strategy;

/**
 * Models
 */
const Users = mongoose.model('User');

/**
 * Serialize User
 *
 * Determines which data of the user object should be stored in the session.
 * Here, the entire user object is stored, which can be optimized to only
 * store the user's ID if needed.
 */
passport.serializeUser((user, done) => {
  done(null, user);
});

/**
 * Deserialize User
 *
 * Retrieves the full user object from the stored session data.
 * Typically, you would query the database to get the full user object
 * using the ID stored in the session.
 */
passport.deserializeUser((user, done) => {
  done(null, user);
});

/**
 * Local Strategy
 *
 * This strategy is used for authenticating users using a username and password.
 * - It searches for a user by the provided username.
 * - If the user is found and the password matches, the user is authenticated.
 * - Otherwise, an error message is returned.
 */
passport.use('local-login', new LocalStrategy(async (username, password, done) => {
  try {
    const error = 'Error en usuario/contraseña'; // Error message for invalid credentials
    const user = await Users.findOne({ username }).exec();

    // If the user is not found or the password doesn't match, return an error
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return done(null, false, { error });
    }

    // If authentication is successful, return the user object
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

/**
 * JWT Strategy
 *
 * This strategy is used to authenticate users based on a JSON Web Token (JWT).
 * - The token is extracted from the Authorization header as a Bearer token.
 * - The payload's `sub` field (usually the user's ID) is used to find the user in the database.
 * - If the user is found, the JWT payload is returned; otherwise, authentication fails.
 */
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(), // Extracts token from Authorization header
  secretOrKey: process.env.JWT_SECRET // Secret key to verify the token
}, async (jwt_payload, done) => {
  try {
    // Find the user by the ID (sub field) in the JWT payload
    const user = await Users.findById(jwt_payload.sub);

    // If the user is found, pass the JWT payload as the authenticated user
    if (user) {
      done(null, jwt_payload);
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
}));

