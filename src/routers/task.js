const express = require('express');
const Task = require('../models/task');
const auth = require('../middleware/authenticate');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) => {
    const readTask = new Task({
        ... req.body,
        owner: req.user._id
    })

    try {
        await readTask.save()
        res.status(201).send(readTask)
    }

    catch(e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=false // Filtering data.
// GET /tasks?limit=2&skip=2  // Pagination.
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }
    try {
        await req.user.populate(
            {
                'path': 'tasks',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort

                }
            }
        ).execPopulate()
        res.send(req.user.tasks)
    } catch(e) {
        res.status(500).send({error: e.message})
    }
    
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = request.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(400).send()
        }
        res.send(task)
    }

    catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        res.status(400).send({error: "No feild present"})
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id})

        if (!task) {
            return res.status(400).send()
        }

        updates.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()
        res.send(task)
    }

    catch (e) {
        res.status(400).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOneAndDelete({_id, owner: req.user._id})
        if (!task) {
            return res.status(400).send()
        }
        res.send(task)
    }

    catch(e) {
        res.status(500).send(e)
    }
})

module.exports = router