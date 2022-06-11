const express = require('express')
const router = express.Router()

const UsersDAO = require("../DAO/users_DAO.js");
const udao = new UsersDAO()

// Registration of a new user
router.post('/', async (req, res) => {
    let user = req.body

    // checking if all the fields are filled
    if (!user.name || !user.last_name || !user.email || !user.password || !user.image) {
        res.status(400).send("All the fields are required")
    }

    // checking if the email is already in use
    if (await udao.isExistingUser(user.email)) {
        res.status(400).send("The email is already in use")
    }

    // checking if the password has at least 8 characters
    if (user.password.length < 8) {
        res.status(400).send("The password must have at least 8 characters")
    }

    // checking if the email is valid
    if (!user.email.includes("@") || !user.email.includes(".")) {
        res.status(400).send("The email is not valid")
    }

    try {
        // inserting the user in the database
        await udao.createUser(user)
        res.status(201).send("User created")
    } catch (error) {
        res.status(500).send("Error creating the user")
    }
})

// Login of a user
router.post('/login', async (req, res) => {
    const user = await udao.getUserByEmail(req.body.email)
    if (user.length === 0) {
        res.status(404).json({ message: "User not found" })
    } else {
        if (user[0].password === req.body.password) {
            // create a token
            const jwt = require('jsonwebtoken')
            const token = jwt.sign({ id: user[0].id, name: user[0].name, email: user[0].email }, process.env.JWT_KEY)

            res.status(200).json({
                acccess_token: token
            })
            
        } else {
            res.status(401).json({ message: "Password incorrect" })
        }
    }
})

// GET of all the users
router.get('/', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const users = await udao.getAll()
        res.status(200).json(users)
    } else {
        res.status(401).json({ message: "Access denied" })
    }
})

// GET of a user by id
router.get('/:id', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getId(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            res.status(200).json(user[0])
        }
    } else {
        res.status(401).json({ message: "Access denied" })
    }
})

// GET of a user by key word (name, last name, email)
router.get('/search/:keyword', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const users = await udao.getUserByKeyWord(req.params.keyword)
        if (users.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            res.status(200).json(users)
        }
    } else {
        res.status(401).json({ message: "Access denied" })
    }
})

// GET of the user statistics by user id
router.get('/:id/statistics', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const statistics = await udao.getUserStatistics(req.params.id)
            res.status(200).json(statistics)
        }
    } else {
        res.status(401).json({ message: "Access denied" })
    }
})

// GET of events created by matching user id
router.get('/:id/events', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserEvents(req.params.id)
            res.status(200).json(events)
        }
    }
})

// GET events in the future created by user with matching id
router.get('/:id/events/future', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserFutureEvents(req.params.id)
            res.status(200).json(events)
        }
    }
})

// GET past events created by user with matching id
router.get('/:id/events/finished', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserPastEvents(req.params.id)
            res.status(200).json(events)
        }
    }
})

// GET current events created by user with matching id
router.get('/:id/events/current', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserCurrentEvents(req.params.id)
            res.status(200).json(events)
        }
    }
})

// GET all friends of a user with matching id
router.get('/:id/friends', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (user.length === 0) {
            res.status(404).json({ message: "User not found" })
        } else {
            const friends = await udao.getUserFriends(req.params.id)
            res.status(200).json(friends)
        }
    }
})


module.exports = router;