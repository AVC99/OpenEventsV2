const express = require('express')
const router = express.Router()
const serverStatus= require('../server_status');

const FriendsDAO = require("../dao/friends_DAO.js");
const fdao = new FriendsDAO()


// Get all the friends of a user
router.get('/', async(req, res) => {
  if (fdao.isValidToken(req)) {
    const friends = await fdao.getAllFriendsByUserId(fdao.getIdFromDecodedToken(req))
    return res.status(200).json(friends)
  } else {
    return res.status(401).json({ message: "Access denied" })
  }
})

// GET of all the friend requests of the authenticated user
router.get('/requests' , async (req, res) => {
  if (fdao.isValidToken(req)) {
    const requests = await fdao.getAllFriendRequestsByUserId(fdao.getIdFromDecodedToken(req))
    res.status(200).json(requests)
  } else {
    res.status(401).json({ message: "Access denied" })
  }
})

// POST create a friend request to a user by id
router.post('/:id' , async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friend = await fdao.createFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id)
    res.status(200).json(friend)
  } else {
    res.status(401).json({ message: "Access denied" })
  }
})

// PUT accept a friend request to a user by id
router.put('/:id' , async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friend = await fdao.acceptFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id)
    await fdao.insertAcceptedFriend(fdao.getIdFromDecodedToken(req), req.params.id)
    res.status(200).json(friend)
  } else {
    res.status(401).json({ message: "Access denied" })
  }
})

// DELETE a friend request to a user by id
router.delete('/:id' , async (req, res) => {
  if (fdao.isValidToken(req)) {
    const friend = await fdao.declineFriendRequest(fdao.getIdFromDecodedToken(req), req.params.id)
    res.status(200).json(friend)
  } else {
    res.status(401).json({ message: "Access denied" })
  }
})

module.exports = router