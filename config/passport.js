const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Reusable login handler
const handleSocialLogin = async (profile, done) => {
  try {
    const { id, emails, displayName, photos, provider } = profile;

    const email = emails?.[0]?.value || null;
    const avatar = photos?.[0]?.value || null;
    const providerIdField = `${provider}Id`;

    let user = await User.findOne({ [providerIdField]: id });

    if (user) return done(null, user);

    if (email) {
      user = await User.findOne({ email });
      if (user) {
        user[providerIdField] = id;
        user.avatar = avatar;
        await user.save();
        return done(null, user);
      }
    }

    const newUser = new User({
      name: displayName || email || "User",
      email,
      avatar,
      [providerIdField]: id,
    });

    await newUser.save();
    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
};

// GOOGLE STRATEGY
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://backend-5nex.onrender.com/api/auth/google/callback",
      proxy: true   // ← IMPORTANT for Render HTTPS
    },
    (accessToken, refreshToken, profile, done) =>
      handleSocialLogin(profile, done)
  )
);

// GITHUB STRATEGY
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://backend-5nex.onrender.com/api/auth/github/callback",
      proxy: true,  // ← IMPORTANT for Render HTTPS
      scope: ["user:email"]
    },
    (accessToken, refreshToken, profile, done) =>
      handleSocialLogin(profile, done)
  )
);

// LinkedIn can go here later

module.exports = passport;
