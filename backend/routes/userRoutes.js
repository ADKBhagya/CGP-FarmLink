const express = require('express');
const { createUser, getUsers } = require('../controller/userController');
const router = express.Router();

router.post('/create', createUser);
router.get('/users', getUsers);

module.exports = router;
