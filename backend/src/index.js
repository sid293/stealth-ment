const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const jwtCheck = require('../middleware/middleware');
const mongoose = require('mongoose');
const {Task, User} = require('./schema');

dotenv.config();
let app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbUrl = process.env.MONGODB_URI;
console.log(dbUrl)
mongoose.connect(dbUrl);
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("connected to db")
});

console.log("script started")

app.post('/signup', async (req, res) => {
    console.log("signup route hit")
    try {
        let user = {};
        user.email = req.body.username;
        user.password = req.body.password;
        console.log(user);
        const newUser = new User(user);
        await newUser.save();
        res.status(201).json({ message: 'user created successfully', success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    let user = req.body;
    console.log(user);
    let result = await User.findOne({ email: user.username, password: user.password });
    if (!result) {
        res.status(401).json({ message: 'Invalid credentials' });
    }else{
        let token = jwt.sign(user, process.env.JWT_SECRET);
        res.send({ message: 'Login successful', token: token });
    }
})

app.get('/usersTasks', jwtCheck, async (req, res) => {
    try {
        console.log("req user: " + req.user)
        const user = await User.findOne({ email: req.user.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const tasks = await Task.find({ userId: user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/tasks', jwtCheck, async (req, res) => {
    console.log("add task route hit")
    try {
        const user = await User.findOne({ email: req.user.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const task = new Task({
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority,
            status: "Incomplete",
            userId: user._id,
            createdAt: new Date()
        });
        const savedTask = await task.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.log("add task error: ",error)
        res.status(400).json({ error: error.message });
    }
});

app.put('/tasks/:taskId', jwtCheck, async (req, res) => {
    console.log("edit task route hit");
    try {
        const user = await User.findOne({ email: req.user.username });
        if (!user) {
            console.log("user not found ");
            return res.status(404).json({ message: 'User not found' });
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.taskId, userId: user._id },
            { 
                // title: req.body.title,
                // description: req.body.description,
                status: req.body.status
            },
            { new: true }
        );
        if (!task) {
            console.log("task not found ");
            return res.status(404).json({ message: 'Task not found' });
        }
        console.log("task: ",task);
        res.json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/tasks/:taskId', jwtCheck, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.username });
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const task = await Task.findOneAndDelete({ _id: req.params.taskId, userId: user._id });
        if (!task) {
            return res.status(404).json({ message: 'Task not found', success: false });
        }
        res.json({ message: 'Task deleted', success: true });
    }catch(error){
        res.status(400).json({ error: error.message });
    }
})

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

