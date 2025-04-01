const express = require('express');
const { followUser, unfollowUser, getFollowers, getFollowing } = require('../controllers/followController');
const {authMiddleware} = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/follow/:userId', authMiddleware, followUser);
router.delete('/follow/:userId', authMiddleware, unfollowUser);
router.get('/followers/:userId', getFollowers);  
router.get('/following/:userId', getFollowing);  

module.exports = router;