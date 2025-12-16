import express from 'express';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import { verifyToken } from './middlewares/verifyToken.js';




//import session config
import { sessionConfig } from './config/session.js';
// Import database connection
import { connectDB } from './config/db.js';
// Import routes
import taskRoutes from './routes/task.js';
//import auth routes
import authRoutes from './routes/auth.js';


const app = express();
const PORT = process.env.PORT || 5000;

//Connect to database
await connectDB();

// Middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

app.use(
  helmet({
    // Ensure X-Frame-Options is still DENY (Helmet defaults to SAMEORIGIN)
    frameguard: { action: "deny" },

    // Configure CSP
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://www.googletagmanager.com",
          "'unsafe-inline'",
        ], // Note: 'unsafe-inline' should be avoided if possible
        styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"], // data: required for inline base64 images
        connectSrc: ["'self'", "http://localhost:5000", "ws://localhost:5000"], // Replace 5000 with your actual backend port
        objectSrc: ["'none'"], // Prevents embedding flash/plugins
      },
    },
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session management
app.use(sessionConfig());
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    res.send('Task Management API is running');

})


// ROUTES

// Auth Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks',verifyToken, taskRoutes)


//404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
