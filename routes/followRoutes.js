const express = require('express');
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');
const router = express.Router();

router.post('/follow/:userId', followUser);
router.delete('/follow/:userId', unfollowUser);
router.get('/followers/:targetUserId', getFollowers);  
router.get('/following/:targetUserId', getFollowing);  

module.exports = router;
