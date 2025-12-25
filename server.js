import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
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

// CORS confiuration for production and development environments
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:5174",
      process.env.CLIENT_URL,
    ].filter(Boolean); // Remove undefined values

    // Allow requests with no origin (like mobile apps, postman,curl, etc)
    if(!origin) return callback(null, true);

    if(allowedOrigins.includes(origin)) {
      callback(null, true);
    }else {
      console.warn(`CORS policy: Blocking request from origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ['content-Type', 'Authorization'],
  exposedHeaders: ['set-Cookie'],
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions)); // Enable pre-flight for all routes

// Trust proxy
if(process.env.NODE_ENV === "production") {
  app.set('trust proxy', 1); // Trust first proxy
}

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
app.use(express.json({limit: '10mb'}));
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

  // Prevent error details from leaking in production
  const errorResponse = {
    error: process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  }
  res.status(err.status || 500).json(errorResponse);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  })
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Client URL: ${process.env.CLIENT_URL}`);
})
