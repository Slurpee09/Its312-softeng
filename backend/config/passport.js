// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientID || !clientSecret) {
  console.warn(
    'Passport: Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET). Skipping Google strategy registration.'
  );
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          "http://localhost:5000/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const googleId = profile.id;
          const fullname = profile.displayName || "";

          if (!email) {
            console.error("No email returned by Google");
            return done(new Error("No email returned by Google"), false);
          }

          // Try find by google_id first
          let user = await User.findByGoogleId(googleId);
          if (user) {
            console.log("User found by Google ID:", user.id);
            return done(null, user, { message: "success" });
          }

          // Then try by email (maybe user signed up via email/password)
          const userByEmail = await User.findByEmail(email);
          const isSignup =
            (req.session && req.session.googleSignup) ||
            (req.query && req.query.signup === "true");

          if (userByEmail) {
            // Associate Google ID if not set
            if (!userByEmail.google_id) {
              try {
                await User.updateGoogleId(email, googleId);
                console.log("Associated Google ID with existing user:", userByEmail.id);
              } catch (e) {
                console.error("Failed to update Google ID:", e);
              }
            }
            return done(null, userByEmail, { message: "success" });
          }

          if (isSignup) {
            // create new user for signup flow
            if (req.session && req.session.googleSignup)
              delete req.session.googleSignup;

            user = await User.createUser({ fullname, email, googleId });
            console.log("New user created via Google signup:", user.id);
            return done(null, user, { message: "signup_success" });
          }

          // Not signup and not found => reject (frontend can prompt to sign up)
          console.log("User not found and not signup flow");
          return done(null, false, { message: "Email not registered" });
        } catch (err) {
          console.error("Google OAuth error:", err);
          return done(err, false);
        }
      }
    )
  );

  console.log("Passport Google strategy registered");
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;
