const express = require('express')
const router = express.Router()

const MessagesDAO = require("../DAO/messages_DAO.js");
const mdao = new MessagesDAO()

const UsersDAO = require("../DAO/users_DAO.js");
const udao = new UsersDAO()

// POST of a message between two users via body (content, sender_id, receiver_id)
router.post('/', async (req, res) => {
    if (mdao.isValidToken(req)) {

        const sender = await udao.getUserById(req.body.user_id_send)
        const receiver = await udao.getUserById(req.body.user_id_recived)

        if (sender.length === 0) {
            res.status(404).json({ message: "Sender not found" })
        } else if (receiver.length === 0) {
            res.status(404).json({ message: "Receiver not found" })
        } else if (req.body.user_id_send === req.body.user_id_recived) {
            res.status(400).json({ message: "Sender and receiver are the same" })
        } else {
            const message = await mdao.postMessage(req.body)
            return res.status(200).json(message)
        }
    } else {
        res.status(401).send("Invalid token")
    }
})

// GET users that are messaging the authenticated user
router.get('/users', async (req, res) => {
    if (mdao.isValidToken(req)) {
        const users = await mdao.getUsersMessaging(mdao.getIdFromDecodedToken(req))
        return res.status(200).json(users)
    } else {
        res.status(401).send("Invalid token")
    }
})



module.exports = router;