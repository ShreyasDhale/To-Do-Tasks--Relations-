const express = require('express');
const User = require('../db/models/user');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/',async (req,res)=>{
    res.sendFile(path.join(__dirname,"../views","Home.html"))
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredential(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
    } catch (e) {
        res.status(400).send(e.message);
        console.log(e);
    }
});

// User logout

router.post('/users/logout', auth, async (req, res) => {
    try {
        // only for loging out current user
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);

        // logout from all devices
        // req.user.tokens = [];
        await req.user.save();
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// Create a new user

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (e) {
        if (e.code === 11000) {
            res.status(400).send('Email already exists');
        } else {
            res.status(400).send(e.message);
        }
    }
});

// list users

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        if (!users) res.status(404).send("No User Found");
        res.status(200).send(users);
    } catch (e) {
        res.status(500).send(e);
    }
});

// list user using headers

router.get('/users/me', auth, async (req, res) => {
    try {
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// find user by id

router.get('/users/:id', async (req, res) => {
    console.log(req.params);
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User not found");
        res.status(200).send(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// update user by id

router.patch('/users/:id', async (req, res) => {
    try {
        if (req.body.password) {
            req.body.password = await User.encryptPassword(req.body.password);
        }
        console.log(req.body)
        console.log(req.params.id)
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) return res.status(404).send("User Not found");
        res.status(200).send(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});


// delete user by id

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.removeUser(req.params.id);
        if (!user) return res.status(404).send("User Not found");
        
        res.status(200).send(user);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;