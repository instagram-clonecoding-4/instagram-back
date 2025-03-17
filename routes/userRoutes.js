const express = require('express');
const {registerUser, loginUser, getUserInfo} = require('../controllers/userController');
const router = express.Router();

router.post('/join', registerUser);
router.post('/login', loginUser);
router.get('/:email', getUserInfo);

module.exports = router;