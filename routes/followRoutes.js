const express = require('express');
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');
const {authMiddleware} = require('../authMiddleware');
const router = express.Router();

router.post('/follow/:email', authMiddleware, followUser);
router.delete('/follow/:email', authMiddleware, unfollowUser);
router.get('/followers/:email', getFollowers);  
router.get('/following/:email', getFollowing);  

module.exports = router;