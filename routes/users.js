const express = require('express');
const router = express.Router();
const validation = require('../middleware/validate')
const {isAuthenticated} = require ("../middleware/authenticate")


const userController = require('../controllers/user');
const { authenticate } = require('passport');

router.get('/', isAuthenticated ,  userController.getAll);

router.get('/:id', isAuthenticated, userController.getSingle);

router.get('/friends/:id', isAuthenticated, userController.getFriends)

router.post('/info', validation.saveUserInfo, userController.saveUserInfo)

router.put('/auth/:id', isAuthenticated, validation.saveUserAuth, userController.changeAuth)

router.put('/addFriend/:id', isAuthenticated, userController.addFriend)

router.put('/removeFriend/:id', isAuthenticated, userController.deleteFriend)

router.put('/:id', isAuthenticated, validation.saveUserInfo, userController.updateUser);


router.delete('/:id', isAuthenticated, userController.deleteUser);

module.exports = router;