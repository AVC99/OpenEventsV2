const express = require('express')
const router = express.Router()
const serverStatus= require('../server_status');

const MessagesDAO = require("../DAO/messages_DAO.js");
const mdao = new MessagesDAO()


const UsersDAO = require("../DAO/users_DAO.js");
const udao = new UsersDAO()

/**
 * Creates message
 * @param {Object} req - request object
 */
router.post('/', async (req, res) => {
    if (mdao.isValidToken(req)) {

        const sender = await udao.getUserById(req.body.user_id_send)
        const receiver = await udao.getUserById(req.body.user_id_recived)

        if (sender.length === 0) {
            res.status(serverStatus.NOT_FOUND).json({ message: "Sender not found" })
        } else if (receiver.length === 0) {
            res.status(serverStatus.NOT_FOUND).json({ message: "Receiver not found" })
        } else if (req.body.user_id_send === req.body.user_id_recived) {
            res.status(serverStatus.BAD_REQUEST).json({ message: "Sender and receiver are the same" })
        } else {
            const message = await mdao.postMessage(req.body)
            return res.status(serverStatus.OK).json(message)
        }
    } else {
        res.status(serverStatus.UNAUTHORIZED).send("Invalid token")
    }
})

/**
 * Gets all external users that are messaging the authenticated user
 * @param {Object} req authenticated token
 */
router.get('/users', async (req, res) => {
    if (mdao.isValidToken(req)) {
        const users = await mdao.getUsersMessaging(mdao.getIdFromDecodedToken(req))

        if (users.length === 0) {
            return res.status(serverStatus.CREATED).json({message: "No messages found"})
        }

        return res.status(serverStatus.OK).json(users)
    } else {
        res.status(serverStatus.UNAUTHORIZED).send("Invalid token")
    }
})
/**
 * Gets all messages between the external user with matching id and the authenticated user
 * @param {Object} req authenticated token
 */
router.get('/:id', async (req, res) => {
    if(mdao.isValidToken(req)) {
        if(!isNaN(req.params.id)){
            try{
                const messages = await mdao.getMessagesBetweenAuthenticatedUserAndUser(mdao.getIdFromDecodedToken(req), req.params.id)

                if (messages.length === 0) {
                    return res.status(serverStatus.CREATED).json({message: "No messages found"})
                }

                return res.status(serverStatus.OK).json(messages)
            }catch(error){
                return res.status(serverStatus.INTERNAL_SERVER_ERROR).send("Error while loading messages")
            } 
        }
    }res.status(serverStatus.UNAUTHORIZED).send("Invalid token")
})



module.exports = router;