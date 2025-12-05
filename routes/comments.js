const express = require('express')
const router = express.Router()
const {isAuthenticated} = require ("../middleware/authenticate")
const validation = require('../middleware/validateComment')

const commentController = require('../controllers/comment');

router.get('/getAll/:id', isAuthenticated, commentController.getAllPostComments);

router.get('/:id', commentController.getSingle);

router.post('/:id', isAuthenticated, validation.saveComment ,commentController.createcomment);

router.put('/:id', isAuthenticated, validation.saveComment, commentController.updatecomment);

router.delete('/:id', isAuthenticated, commentController.deletecomment);

module.exports = router;
