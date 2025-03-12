const express = require('express');
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');

const router = express.Router();

router.post('/followUser/:userId', followUser);
router.post('/unfollowUser/:userId', unfollowUser);
router.get('/followers/:targetUserId', getFollowers);  
router.get('/following/:targetUserId', getFollowing);  

module.exports = router;
