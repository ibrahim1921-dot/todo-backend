import { checkSchema, validationResult } from "express-validator";
import {
  registerValidator,
  loginValidator,
} from "../validators/authValidators.js";
import "../config/localPassport.js";
import User from "../models/users.js";
import {  hashPassword } from "../helpers/password.js";
import passport from "passport";

export const register = [
  checkSchema(registerValidator),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;
      // check if user exists
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: "User with this email already exists",
        });
      }
      // Hash password
      const hashedPassword = await hashPassword(password);
      // Create a new user
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        authProvider: "local",
      });
      req.login(newUser, (err) => {
        if (err) return next(err);

        //Send response
        return res.status(201).json({
          success: true,
          message: "User registered successfully",
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
          },
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Server error during registration",
        details: error.message,
      });
    }
  },
];

export const login = [
  // Validate incoming requests
  checkSchema(loginValidator),
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({success: false, errors: errors.array() });
      }

      // Authenticate user using passport
      passport.authenticate("local", {session:false},(err, user, info) => {
        if (err) {
            console.log('Authentication error:', err);
            return res.status(500).json({
                success: false,
                error: "Server error during authentication",
            })
        }
        // Handle authentication failure
        if (!user) {

            if(info && info.message === "Please log in using Google") {
                return res.status(401).json({
                    success: false,
                    error: "Please log in using Google",
                    authProvider: "google",
                });
            }
          return res.status(401).json({
            success: false,
            error: info?.message || "Authentication failed",
            
          });
        }
       
        // AUTHENTICATION SUCCESSFUL: user object is available

        // Generate token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username: user.username,
                authProvider: user.authProvider,
            }, process.env.JWT_SECRET, {expiresIn: '7d'}
        )

        // Send response with token
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        })

        // Send the final message
        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                authProvider: user.authProvider,
            },
        })
      })(req, res, next);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Server error during login",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

// Logout user

export const logout = (req, res) => {
    res.clearCookie('jwt', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    })

    res.status(200).json({
        success: true,
        message: "Logout successful",
    })
}