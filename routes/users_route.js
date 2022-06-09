const express= require('express');
const router= express.Router();

const UserDAO= require('../dao/user_dao');
const userDAO= new UserDAO();

module.exports= router;