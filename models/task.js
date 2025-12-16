import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Task text is required"],
      trim: true,
      maxlength: [500, "Task cannot exceed 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Index for faster queries
taskSchema.index({ position: -1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;
