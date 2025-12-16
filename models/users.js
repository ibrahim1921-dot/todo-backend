import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [50, "Username cannot exceed 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    isEmail: true,
    normalizeEmail: true,
  },
  password: {
    type: String,
    required: function() {
        return this.authProvider === "local";
    },
    minlength: [8, "Password must be at least 6 characters"],
    trim: true,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,

  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  }
},{
    timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;