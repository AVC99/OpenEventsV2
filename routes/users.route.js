const express = require('express')
const router = express.Router()
const serverStatus = require('../server_status');
const bcrypt = require('bcrypt');


const UsersDAO = require("../DAO/users_DAO.js");
const udao = new UsersDAO()

// Registration of a new user
router.post('/', async (req, res) => {
    let user = req.body

    // checking if all the fields are filled
    if (!user.name || !user.last_name || !user.email || !user.password || !user.image) {
        return res.status(400).send("All the fields are required")
    } else {
        // checking if the email is already in use
        if (await udao.isExistingUser(user.email)) {
            return res.status(400).send("The email is already in use")
        }

        // checking if the password has at least 8 characters
        if (user.password.length < 8) {
            return res.status(400).send("The password must have at least 8 characters")
        }

        // checking if the email is valid
        if (!user.email.includes("@") || !user.email.includes(".")) {
            return res.status(400).send("The email is not valid")
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;
            // inserting the user in the database
            await udao.createUser(user)
            return res.status(201).send("User created")
        } catch (error) {
            return res.status(500).send("Error creating the user")
        }
    }


})

// Login of a user
router.post('/login', async (req, res) => {
    const user = await udao.getUserByEmail(req.body.email)
    if (user.length === 0) {
        return res.status(404).json({ message: "User not found" })
    } else {
        //desecrypting the password
        const passwordIsValid = await bcrypt.compare(req.body.password, user[0].password)
        
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid password" })
        } else {
            // create a token
            const jwt = require('jsonwebtoken')
            const token = jwt.sign({ id: user[0].id, name: user[0].name, email: user[0].email }, process.env.JWT_KEY)
            return res.status(200).json({ token: token })
        }
    }
})

// GET of all the users
router.get('/', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const users = await udao.getAll()
        return res.status(200).json(users)
    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})

// GET of a user by id
router.get('/:id', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            return res.status(200).json(user[0])
        }
    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})

// GET of a user by key word (name, last name, email)
router.get('/search/:keyword', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const users = await udao.getUserByKeyWord(req.params.keyword)
        if (users.length === 0) {
            return res.status(404).json({ message: "User not found" })
        } else {
            return res.status(200).json(users)
        }
    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})

// GET of events created by matching user id
router.get('/:id/events', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserEvents(req.params.id)
            return res.status(200).json(events)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

// GET events in the future created by user with matching id
router.get('/:id/events/future', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserFutureEvents(req.params.id)
            return res.status(200).json(events)
        }
    } else {
        return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
    }
})

// GET past events created by user with matching id
router.get('/:id/events/finished', async (req, res) => {

    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserPastEvents(req.params.id)
            return res.status(200).json(events)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

// GET current events created by user with matching id
router.get('/:id/events/current', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const events = await udao.getUserCurrentEvents(req.params.id)

            if (events.length === 0) {
                return res.status(201).json({message: "No events"})
            }

            return res.status(200).json(events)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

// GET all friends of a user with matching id
router.get('/:id/friends', async (req, res) => {
    if (udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const friends = await udao.getUserFriends(req.params.id)

            if (friends.length === 0) {
                return res.status(201).json({message: "No friends :("})
            }

            return res.status(200).json(friends)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

router.put('/', async (req, res) => {
    if (udao.isValidToken(req)) {
        try {
            const authenticatedID = await udao.getIdFromDecodedToken(req);
            const user = await udao.getUserById(authenticatedID);
            if (user) {
                if (req.body.name) user.name = req.body.name;
                if (req.body.last_name) user.last_name = req.body.last_name;
                if (req.body.email) user.email = req.body.email;
                if (req.body.password) {
                    const bodyPassword= req.body.password;
                    const salt = await bcrypt.genSalt(10);
                    const hash = await bcrypt.hash(bodyPassword, salt);
                    user.password = hash;
                    
                }
                if (req.body.image) user.image = req.body.image;
                await udao.updateUser(user);
                return res.status(serverStatus.CREATED).json(user)

            } else return res.status(serverStatus.NOT_FOUND).send("User not found");
        } catch (error) {
          return res.status(serverStatus.INTERNAL_SERVER_ERROR).send( "Error updating user");
        }

    }
    return res.status(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

// GET user statistics by user id
//Gets the user statistics: average score given for events "puntuation", number of comments written for
//events, and percentage of users with lower number of comments than this user.

router.get('/:id/statistics', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const stats1 = await udao.getUserStatisticsAvgScore(req.params.id)
            const stats2 = await udao.getUserStatisticsNumComments(req.params.id)
            const stats3 = await udao.getUserStatisticsPercentageComments(req.params.id)

            return res.status(200).json({
                avg_score: stats1[0].avg_score,
                num_comments: stats2[0].num_comments,
                percentage_commenters_below: stats3
            })
        }
    }
})

// DELETE of authenticated user
router.delete('/', async (req, res) => {
    if (await udao.isValidToken(req)) {
        await udao.deleteUser(udao.getIdFromDecodedToken(req))
        return res.status(200).json({ message: "User deleted!!!" })

    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})

// Gets all events with assistance by user with matching id
router.get('/:id/assistances', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const assistances = await udao.getUserAssistanceEvents(req.params.id)
            const comments = await udao.getUserAssistanceComments(req.params.id)

            // Add puntuation and commentary from const comments to events
            for (let i = 0; i < assistances.length; i++) {
                assistances[i].puntuation = comments[i].puntuation;
                assistances[i].commentary = comments[i].comentary;
            }

            return res.status(200).json(assistances)
        }
    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})

// Gets all future events with assistance by user with matching id
router.get('/:id/assistances/future', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const assistances = await udao.getUserFutureAssistanceEvents(req.params.id)

            if (assistances.length === 0) {
                return res.status(201).json({message: "No events"})
            }

            return res.status(200).json(assistances)
        }
    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})

// Gets all past events with assistance by user with matching id
router.get('/:id/assistances/finished', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        } else {
            const assistances = await udao.getUserPastAssistanceEvents(req.params.id)

            // get user comments by event id and add to events
            for (let i = 0; i < assistances.length; i++) {
                const comments = await udao.getUserAssistanceCommentsByEvent(assistances[i].id)
                assistances[i].puntuation = comments[0].puntuation;
                assistances[i].commentary = comments[0].comentary;
            }


            return res.status(200).json(assistances)
        }
    } else {
        return res.status(401).json({ message: "Access denied" })
    }
})


module.exports = router;