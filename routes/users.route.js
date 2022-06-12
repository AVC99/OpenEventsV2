const express = require('express')
const router = express.Router()
const serverStatus = require('../server_status');
const bcrypt = require('bcrypt');



const UsersDAO = require("../DAO/users_DAO.js");
const udao = new UsersDAO()

/**
 * Creates user
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
router.post('/', async (req, res) => {
    let user = req.body

    // checking if all the fields are filled
    if (!user.name || !user.last_name || !user.email || !user.password || !user.image) {
        return res.status(serverStatus.BAD_REQUEST).send("All the fields are required")
    } else {
        // checking if the email is already in use
        if (await udao.isExistingUser(user.email)) {
            return res.status(serverStatus.BAD_REQUEST).send("The email is already in use")
        }

        // checking if the password has at least 8 characters
        if (user.password.length < 8) {
            return res.status(serverStatus.BAD_REQUEST).send("The password must have at least 8 characters")
        }

        // checking if the email is valid
        if (!user.email.includes("@") || !user.email.includes(".")) {
            return res.status(serverStatus.BAD_REQUEST).send("The email is not valid")
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(user.password, salt);
            user.password = hash;
            // inserting the user in the database
            await udao.createUser(user)
            return res.status(serverStatus.CREATED).send("User created")
        } catch (error) {
            return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error creating the user")
        }
    }


})

/**
 * Authenticates user
 * @param {Object} req - json with email and password
 */
router.post('/login', async (req, res) => {
    const user = await udao.getUserByEmail(req.body.email)
    if (user.length === 0) {
        return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
    } else {
        //desecrypting the password
        const passwordIsValid = await bcrypt.compare(req.body.password, user.password)
        
        if (!passwordIsValid) {
            return res.status(serverStatus.UNAUTHORIZED).json({ message: "Invalid password" })
        } else {
            // create a token
            const jwt = require('jsonwebtoken')
            const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, process.env.JWT_KEY)
            return res.status(serverStatus.OK).json({ token: token })
        }
    }
})

/**
 * Gets all users
 * @param {Object} req - request with Authorization header
 */
router.get('/', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const users = await udao.getAll()
        return res.status(serverStatus.OK).json(users)
    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})

/**
 * Gets user by id
 * @param {Object} req - request with Authorization header
 */
router.get('/:id', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            return res.status(serverStatus.OK).json(user[0])
        }
    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})

/**
 * Searches users with a name, last name or email matching the value of the query parameter
 * @param {Object} req - request with Authorization header and query parameter
 */
router.get('/search/:keyword', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const users = await udao.getUserByKeyWord(req.params.keyword)
        if (users.length === 0) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            return res.status(serverStatus.OK).json(users)
        }
    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})

/**
 * Gets all events created by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/events', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const events = await udao.getUserEvents(req.params.id)
            return res.status(serverStatus.OK).json(events)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Gets events in the future created by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/events/future', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const events = await udao.getUserFutureEvents(req.params.id)
            return res.status(serverStatus.OK).json(events)
        }
    } else {
        return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
    }
})

/**
 * Gets events in the past created by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/events/finished', async (req, res) => {

    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const events = await udao.getUserPastEvents(req.params.id)
            return res.status(serverStatus.OK).json(events)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Gets events occurring right now created by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/events/current', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const events = await udao.getUserCurrentEvents(req.params.id)

            if (events.length === 0) {
                return res.status(serverStatus.CREATED).json({message: "No events"})
            }

            return res.status(serverStatus.OK).json(events)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Gets all users who are friends with user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/friends', async (req, res) => {
    if (udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const friends = await udao.getUserFriends(req.params.id)

            if (friends.length === 0) {
                return res.status(serverStatus.CREATED).json({message: "No friends :("})
            }

            return res.status(serverStatus.OK).json(friends)
        }
    } return res.sendStatus(serverStatus.UNAUTHORIZED).send("Unauthorized");
})

/**
 * Edits specified fields of the authenticated user
 * @param {Object} req - request with Authorization header and containing the fields to be edited
 */
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

/**
 * Gets the user statistics: average score given for events "puntuation", number of comments written for
 * events, and percentage of users with lower number of comments than this user.
 * @param {Integer} req id User id
 */
router.get('/:id/statistics', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const stats1 = await udao.getUserStatisticsAvgScore(req.params.id)
            const stats2 = await udao.getUserStatisticsNumComments(req.params.id)
            const stats3 = await udao.getUserStatisticsPercentageComments(req.params.id)

            return res.status(serverStatus.OK).json({
                avg_score: stats1[0].avg_score,
                num_comments: stats2[0].num_comments,
                percentage_commenters_below: stats3
            })
        }
    }
})

/**
 * Deletes the authenticated user
 * @param {Object} req - request with Authorization header
 */
router.delete('/', async (req, res) => {
    if (await udao.isValidToken(req)) {
        await udao.deleteUser(udao.getIdFromDecodedToken(req))
        return res.status(serverStatus.OK).json({ message: "User deleted!!!" })

    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})

/**
 * Gets all events with assistance by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/assistances', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const assistances = await udao.getUserAssistanceEvents(req.params.id)
            const comments = await udao.getUserAssistanceComments(req.params.id)

            // Add puntuation and commentary from const comments to events
            for (let i = 0; i < assistances.length; i++) {
                assistances[i].puntuation = comments[i].puntuation;
                assistances[i].commentary = comments[i].comentary;
            }

            return res.status(serverStatus.OK).json(assistances)
        }
    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})

/**
 * Gets events in the future with assistance by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/assistances/future', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const assistances = await udao.getUserFutureAssistanceEvents(req.params.id)

            if (assistances.length === 0) {
                return res.status(serverStatus.CREATED).json({message: "No events"})
            }

            return res.status(serverStatus.OK).json(assistances)
        }
    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})

/**
 * Gets all events in the past with assistance by user with matching id
 * @param {Object} req - request with Authorization header and parameter id
 */
router.get('/:id/assistances/finished', async (req, res) => {
    if (await udao.isValidToken(req)) {
        const user = await udao.getUserById(req.params.id)
        if (!user) {
            return res.status(serverStatus.NOT_FOUND).json({ message: "User not found" })
        } else {
            const assistances = await udao.getUserPastAssistanceEvents(req.params.id)

            // get user comments by event id and add to events
            for (let i = 0; i < assistances.length; i++) {
                const comments = await udao.getUserAssistanceCommentsByEvent(assistances[i].id)
                assistances[i].puntuation = comments[0].puntuation;
                assistances[i].commentary = comments[0].comentary;
            }


            return res.status(serverStatus.OK).json(assistances)
        }
    } else {
        return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
    }
})


module.exports = router;