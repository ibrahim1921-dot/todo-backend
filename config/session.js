import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

export const sessionConfig = () => {
  const MONGO_URI = process.env.MONGO_URI;
  const SESSION_SECRET = process.env.SESSION_SECRET;  

  if(!MONGO_URI || !SESSION_SECRET) {
    throw new Error("MONGO_URI and SESSION_SECRET must be defined in environment variables");
  }

// Determine connection method
let storeConfig;
if(mongoose.connection.readyState === 1) {
    storeConfig = {
        client: mongoose.connection.getClient(),
        collectionName: "sessions",
    }
} else {
    storeConfig = {
        mongoUrl: MONGO_URI,
        collectionName: "sessions",
    }
}

  return session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

    cookie: {
      secure: process.env.NODE_ENV === "production", // Set to true in production
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },

    store: MongoStore.create({
      ...storeConfig,
      ttl: 60 * 60 * 24 * 7, // 1 week
      autoRemove: "native", // Let MongoDB handle removal
    }),
  });
};
