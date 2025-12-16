import Task from "../models/task.js";
import { Router} from "express";

const router = Router();

// Get all tasks sorted by position
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ position: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    // Increment position of all existing tasks
    await Task.updateMany({}, { $inc: { position: 1 } });

    
    // Create and save new task to database
    const newTask = await Task.create({
      text,
      position: 0,
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({error: error.message})
  }
});

// Update task
router.put('/:id', async (req, res) => {
    try{
    const {completed, text} = req.body;
    const updateData = {};

    if(completed !== undefined) updateData.completed = completed;
    if(text !== undefined) updateData.text = text;

    const task = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        {new: true, runValidators: true}
    );

    if(!task) {
        return res.status(404).json({error: "Task not found"});
    }
    res.json(task);

    } catch(error) {
        res.status(400).json({error: error.message});
    }
})

//Update task position
router.post('/reorder', async (req, res) => {
    try{
        const {tasks} = req.body; //Array of task IDs in new order

        const updatePromises = tasks.map(({id, position}) =>
            Task.findByIdAndUpdate(id, {position})
        );

        await Promise.all(updatePromises);
        const updatedTasks = await Task.find().sort({position: 1});

        res.json(updatedTasks);
    }catch(error){
        res.status(400).json({error: error.message});
    }
})

// Delete task
router.delete('/:id', async (req, res) => {
    try{
        const task = await Task.findByIdAndDelete(req.params.id);

        if(!task) {
            return res.status(404).json({error: "Task not found"});
        }

        res.status(204).send();
    } catch(error){
        res.status(500).json({error: error.message});
    }
})

export default router;
