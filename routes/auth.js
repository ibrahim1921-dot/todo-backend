import { register, login, logout } from "../controllers/auth.js";
import { Router } from "express";
import { apiLimiter } from "../helpers/rateLimit.js";
import passport from "passport";
import jwt from "jsonwebtoken";

//import google passport config
import "../config/googlePassport.js";

const router = Router();

// LOCAL AUTH ROUTES

// Register route
router.post("/register", register);

// Login route
router.post("/login", apiLimiter, login);

// Logout route
router.post("/logout", logout);

// GOOGLE AUTH ROUTES
// (These would typically redirect to Google and handle callbacks,
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/login", session: false }),
  (req, res) => {
    const user = req.user;

    // Here you can create a JWT
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username,
            authProvider: 'google',
        },
        process.env.JWT_SECRET, {expiresIn: '7d'}
    )

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    });

    // Redirect or respond with token
    res.redirect("http://localhost:5000")
  }
);
export default router;
