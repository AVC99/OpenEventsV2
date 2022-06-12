const express = require('express')
const router = express.Router()
const serverStatus = require('../server_status');

const FriendsDAO = require("../dao/friends_DAO.js");
const fdao = new FriendsDAO()

/**
 * Gets all external users that are friends with the authenticated user
 * @param {Object} req authenticated token
 */
router.get('/', async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friends = await fdao.getAllFriendsByUserId(fdao.getIdFromDecodedToken(req))

    if (friends.length === 0) {
      return res.status(serverStatus.ACCEPTED).json({message: "No friends :("})
    }

    return res.status(serverStatus.OK).json(friends)
  } else {
    return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
  }
})

/**
 * Gets all external users that have sent a friendship request to the authenticated user
 * @param {Object} req authenticated token
 */
router.get('/requests', async (req, res) => {
  if (fdao.isValidToken(req)) {
    const requests = await fdao.getAllFriendRequestsByUserId(fdao.getIdFromDecodedToken(req))

    if (requests.length === 0) {
      return res.status(serverStatus.ACCEPTED).json({message: "No requests found"})
    }

    res.status(serverStatus.OK).json(requests)
  } else {
    res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
  }
})

/**
 * Creates friendship request to external user with match id from authenticated user
 * @param {Object} req authenticated token and user id as params
 */
router.post('/:id', async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friends = await fdao.getFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id);
    if (friends.length !== 0) {
      return res.status(serverStatus.ACCEPTED).json({ message: "Friend request already sent" })
    }
    const friend = await fdao.createFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id)
    return res.status(serverStatus.OK).json(friend)
  } else {
    return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
  }
})

/**
 * Accepts friendship request from external user to authenticated user
 * @param {Object} req authenticated token and user id as params
 */
router.put('/:id', async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friend = await fdao.acceptFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id)
    if (friend === 0) {
      return res.status(serverStatus.ACCEPTED).json({ message: "Friend request already accepted" })
    }
    //await fdao.insertAcceptedFriend(fdao.getIdFromDecodedToken(req), req.params.id)
    res.status(serverStatus.OK).json(friend)
  } else {
    res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
  }
})

/**
 * Rejects friendship request from external user to authenticated user
 * @param {Object} req authenticated token and user id as params
 */
router.delete('/:id', async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friend = await fdao.getFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id);
    if (friend.length === 0) {
      return res.status(serverStatus.ACCEPTED).json({ message: "Friend request already declined" })
    }
    await fdao.declineFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id)
    return res.status(serverStatus.OK).json(friend)
  } else {
    return res.status(serverStatus.UNAUTHORIZED).json({ message: "Access denied" })
  }
  
})

module.exports = router