const express = require('express');
const router = express.Router();
const validation = require('../middleware/validate')
const {isAuthenticated} = require ("../middleware/authenticate")


const userController = require('../controllers/user');

router.get('/', isAuthenticated ,  userController.getAll);

router.get('/:id', isAuthenticated, userController.getSingle);

router.post('/info', validation.saveUserInfo, userController.saveUserInfo)

router.put('/auth/:id', isAuthenticated, validation.saveUserAuth, userController.changeAuth)

router.put('/:id', isAuthenticated, validation.saveUserInfo, userController.updateUser);

router.delete('/:id', isAuthenticated, userController.deleteUser);

module.exports = router;