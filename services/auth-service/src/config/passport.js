const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return done(null, user);
    }

    // Check if email is already registered
    const email = profile.emails?.[0]?.value;
    user = await User.findOne({ email });

    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      if (!user.avatar) user.avatar = profile.photos?.[0]?.value;
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      name: profile.displayName,
      email,
      googleId: profile.id,
      avatar: profile.photos?.[0]?.value,
      isVerified: true
    });

    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

module.exports = passport;
