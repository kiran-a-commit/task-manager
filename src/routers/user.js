const express = require('express');
const multer = require('multer');
const User = require('../models/user');
const auth = require('../middleware/authenticate');
const { sendWelcomeMail, sendCancellationMail } = require('../emails/account');
const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Please upload an image.'))
        }

        cb(null, true)
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeMail(user.email, user.name)
        const token = await user.generateAuthToken()

        res.status(201).send({user, token})
    }

    catch(e) {
        res.status(400).send(e.message)
    }
    
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)

        console.log(user)

        const token = await user.generateAuthToken()

        console.log(token)
        res.send({user, token})
    }

    catch(e) {
        res.status(400).send({error: e.message})
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
    
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
    
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user)
    }

    catch(e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    
    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(400).send()
        }
        res.send(user)
    }

    catch(e) {
        res.status(500).send()
    }
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'password', 'email']

    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        res.status(400).send({error: "No feild present"})
    }

    try {

        const user = req.user
        updates.forEach((update) => {
            user[update] = req.body[update]
        })

        await user.save()
        res.send(user)
    }

    catch (e) {
        res.status(400).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'),
async (req, res) => {
    const buffer = sharp(req.file.buffer).resize(200, 200).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth,
async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/id:/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        sendCancellationMail(req.user.email, req.user.name)
        res.send(req.user)
    }

    catch(e) {
        res.status(500).send()
    }
})

module.exports = router