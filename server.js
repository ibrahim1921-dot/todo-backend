import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import { verifyToken } from './middlewares/verifyToken.js';
import cookieParser from 'cookie-parser';




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
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.CLIENT_URL, "https://todo-frontend-two-xi.vercel.app/"]
        : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ['content-Type', 'Authorization'],
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
        connectSrc: [
          "'self'",
          process.env.NODE_ENV === "production"
            ? process.env.CLIENT_URL
            : "http://localhost:5000",
          "ws://localhost:5000",
          "wss://localhost:5000",
        ], 
        objectSrc: ["'none'"], // Prevents embedding flash/plugins
      },
    },
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
app.use('/api/tasks', taskRoutes)


//404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "An unexpected error occurred!",
    error: process.env.NODE_ENV === "production" ? err.message : undefined,
  })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Client URL: ${process.env.CLIENT_URL}`);
})
