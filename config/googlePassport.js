import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import 'dotenv/config';


import User from "../models/users.js";


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        //Check if email already exists (from local registration)
        existingUser = await User.findOne({ email: profile.emails[0].value });

        if (existingUser) {
          // Link Google account
          existingUser.googleId = profile.id;
          existingUser.authProvider = "google";
          await existingUser.save();
          return done(null, existingUser);
        }

        // Create new user
        const newUser = await User.create({
          googleId: profile.id,
          username:
            profile.displayName || profile.emails[0].value.split("@")[0],
          email: profile.emails[0].value,
          authProvider: "google",
        });
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user into the sessions
passport.serializeUser((user, done) => {
  if(!user || !user._id) {
    return done(new Error("User object is invalid"), null);
  }
  done(null, user._id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
  try {
    const findUser = await User.findById(id);
    done(null, findUser);
  } catch (error) {
    done(error, null);
  }
});

export default passport;