const express = require('express');
const router = express.Router();
const validation = require('../middleware/validatePost')
const {isAuthenticated} = require ("../middleware/authenticate")

const postController = require('../controllers/post');

router.get('/', isAuthenticated, postController.getAll);

router.get('/:id', postController.getSingle);

router.post('/:id', isAuthenticated, validation.saveContact, postController.createPost);

router.put('/:id', isAuthenticated, validation.saveContact, postController.updatePost);

router.delete('/:id', isAuthenticated, postController.deletePost);

module.exports = router;