import express from 'express';
import { Task } from '../models/taskModel.js';
import { User } from '../models/userModel.js';

const taskRouter = express.Router();

// Get all tasks
taskRouter.get('/', async (request, response) => {
    try {
        const tasks = await Task.find({});
        return response.status(200).json({
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        response.status(500).send({ message: "something went wrong" });
    }
});

taskRouter.get('/todo/:id', async (req, res) => {
    const taskId = req.params.id;

    try {
        const task = await Task.findById(taskId); // Await the asynchronous call

        if (!task) {
            return res.status(404).json({ message: "Task not found" }); // Handle case where no task is found
        }

        return res.status(200).json({ data: task }); // Return the task
    } catch (error) {
        res.status(500).send({ message: error.message }); // Send error message
    }
});
// Create a new task
taskRouter.post('/create', async (request, response) => {
    try {
        const { title, description, owner, deadline } = request.body;

        // Check for missing required fields
        if (!title || !description || !owner) {
            return response.status(404).send({ message: 'Required all fields' });
        }

        // Prepare task data with optional deadline field
        const newTask = {
            title,
            description,
            owner,
            type: 'todo',
            deadline: deadline ? new Date(deadline) : null // Ensure deadline is a Date if provided
        };

        const task = await Task.create(newTask);
        return response.status(201).send(task);
    } catch (error) {
        response.status(500).send({ message: error.message });
    }
});

// Update an existing task
taskRouter.put('/update/:id', async (request, response) => {
    try {
        const { title, description, owner, deadline } = request.body;

        // Check for missing required fields
        if (!title || !description || !owner) {
            return response.status(404).send({ message: 'Required all fields' });
        }

        const { id } = request.params;

        // Prepare updated task data with optional deadline field
        const updatedTask = {
            title,
            description,
            owner,
            type: request.body.type, // Default to 'todo' if no status is provided
            deadline: deadline ? new Date(deadline) : null // Ensure deadline is a Date if provided
        };

        const result = await Task.findByIdAndUpdate(id, updatedTask, { new: true });

        if (!result) {
            return response.status(404).send({ message: 'Task not found' });
        }

        return response.status(200).send({ message: 'Task has been updated', task: result });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});

// Delete a task
taskRouter.delete('/delete/:id', async (request, response) => {
    try {
        const { id } = request.params;
        const result = await Task.findByIdAndDelete(id);

        if (!result) {
            return response.status(404).send({ message: 'Task not found' });
        }
        return response.status(200).send({ message: 'Task has been deleted' });
    } catch (error) {
        return response.status(500).send({ message: error.message });
    }
});


export default taskRouter;
