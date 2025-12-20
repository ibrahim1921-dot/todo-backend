import Task from "../models/task.js";
import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = Router();

// Apply verifyToken middleware to all routes in this router
router.use(verifyToken);

// Get all tasks sorted by position
router.get("/", async (req, res) => {
  try {
    // Get tasks for the authenticated user
    const tasks = await Task.find({ user: req.user._id }).sort({ position: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Server error fetching tasks",
      status: error.message,
    });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Task text is required" });
    }

    // Increment position of all existing tasks
    await Task.updateMany(
      {
        user: req.user._id,
      },
      { $inc: { position: 1 } }
    );

    // Create and save new task to database
    const newTask = await Task.create({
      text: text.trim(),
      position: 0,
      user: req.user._id, // Associate task with authenticated user
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update task
router.put("/:id", async (req, res) => {
  try {
    const { completed, text } = req.body;
    const updateData = {};

    if (completed !== undefined) updateData.completed = completed;
    if (text !== undefined) updateData.text = text.trim();

    const task = await Task.findByIdAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//Update task position
router.post("/reorder", async (req, res) => {
  try {
    const { tasks } = req.body; //Array of task IDs in new order

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Invalid tasks array" });
    }

    const updatePromises = tasks.map(({ id, position }) =>
      Task.findByIdAndUpdate(
        { _id: id, user: req.user._id },
        { position },
        { new: true }
      )
    );

    await Promise.all(updatePromises);
    const updatedTasks = await Task.find({ user: req.user._id }).sort({
      position: 1,
    });

    res.json(updatedTasks);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete({_id: req.params.id, user: req.user._id});

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
