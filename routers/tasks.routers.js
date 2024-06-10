const express = require('express');
const Tasks = require('../db/models/tasks');
const auth = require('../middleware/auth');

const router = express.Router();

// Create tasks

router.post('/tasks', auth, async (req, res) => {
    const tasks = new Tasks({ ...req.body, owner: req.user._id });
    try {
        const task = await tasks.save().then(console.log("Task saved successfully"));
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send(e.message);
    }
});

// list tasks according to query

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.isCompleted) {
        match.isCompleted = req.query.isCompleted === 'true'
    }
    if (req.query.sortBy) {
        const str = req.query.sortBy.split(':')
        sort[str[0]] = str[1] === 'desc' ? -1 : 1
    }
    try {
        if (req.query == {}) {
            const tasks = await Tasks.find({ owner: req.user._id });
            if (!tasks) return res.status(404).send("No Tasks Found");
            res.status(200).send(tasks);
        } else {
            await req.user.populate({
                path: 'tasks',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                }
            })

            if (!req.user.tasks.length) return res.status(404).send("No Tasks Found");
            res.status(200).send(req.user.tasks);
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// find task by id

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Tasks.findOne({ _id: req.params.id, owner: req.user._id });
        if (!task) return res.status(404).send("Tasks not found");
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Update task by id

router.patch('/tasks/:id', async (req, res) => {

    try {
        const allowedUpdates = ['name', 'isCompleted'];
        const keys = Object.keys(req.body);
        const isUpdationValid = keys.every(key => allowedUpdates.includes(key));

        if (!isUpdationValid) res.status(400).send();
        const task = await Tasks.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!task) return res.status(404).send("Tasks not found");
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// delete user by id

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Tasks.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task) return res.status(404).send("Task Not found");
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;