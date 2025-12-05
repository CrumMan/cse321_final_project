const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;


const getAllPostComments = async (req, res) => {
    try{
        const id = req.params.id
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({message: "ERR 400: Invalid post ID"});
        }
        const postId = new ObjectId(id);

        const comments = await mongodb
        .getDb()
        .collection("comment")
        .find({postId: postId})
        .toArray()
        if(!comments || comments.length === 0){
            return res.status(404).json({message: "No Comments found for this post"})
        }
        res.status(201).json(comments)
}
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching comments collection'})
    }
}

const getSingle = async(req,res) => {
   try{
     if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Error 400: Invalid comment ID format' });
  }
    const commentId = new ObjectId(req.params.id)
    mongodb
    .getDb()
    .collection('comment')
    .find({_id: commentId})
    .toArray()
    .then(comment => {
        if (!comment || comment.length === 0) {
        return res.status(400).json({ message: "No comments found" });
    }
         res.setHeader('content-type',' application/json')
         res.status(200).json(comment[0])
    })}
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching comments collection'})
    }
}

const createcomment = async (req,res) => {
    try{
        const id = req.params.id;
        if (!ObjectId.isValid(id)){
            return res.status(400).json({message:"ERR 400: Invalid user ID"})
        }
        const postId = new ObjectId(id)

        const post = await mongodb
        .getDb()
        .collection("post")
        .findOne({_id: postId})
        
        if(!post){
            return res.status(404).json({message: "Post not found"})
        }
        const sessionUser = req.session.user
        if(!sessionUser || !sessionUser._id) {
            return res.status(401).json({message:"User not authenticated"})
        }

        const comment = {
            postId: postId,
            userId: new ObjectId(sessionUser._id),
            content:req.body.content
        }
        const response = await mongodb
        .getDb()
        .collection('comment')
        .insertOne(comment)

        if(response.acknowledged){
            res.status(201).send(response)
        } 
    }
catch(err){
        res.status(500).json({message:err.message || 'Error fetching comments collection'})
    }
}

const updatecomment = async (req,res) => {
try{
    const id = req.params.id;

    if (!ObjectId.isValid(id)){
        return res.status(400).json({message: "ERR 400: Invalid comment ID"})
    }
    const commentId = new ObjectId(id);
    const existingComment = await mongodb
    .getDb()
    .collection('comment')
    .findOne({_id: commentId})

    if(!existingComment.userId){
        return res.status(404).json({message: "Post not found"})
    }

    const sessionUser = req.session.user;

        if(!sessionUser || !sessionUser._id) {
            return res.status(401).json({message:"User not authenticated"})
        }
        if(existingComment.userId.toString() !== sessionUser._id.toString()){
            return res.status(403).json({message: "ERR 403: You must be the user to update the comment"})
        }
        const comment = {
            userId: existingComment._id,
            postId: existingComment.postId,
            content:req.body.content
        }

    const response = await mongodb
    .getDb()
    .collection('comment')
    .replaceOne({ _id: commentId }, comment)
    if (response.modifiedCount > 0) {
        res.status(204).send();
    } else {
        res.status(400).json({ message: "Comment was not modified" });
        }
}
catch(err){
        res.status(500).json({message:err.message || 'Error fetching posts collection'})
    }
}

const deletecomment = async (req,res) => {
    try{
        const commentId = new ObjectId(req.params.id)
        const response = await mongodb
        .getDb()
        .collection('comment')
        .deleteOne({_id: commentId},true)
        if (response.deletedCount > 0){
            res.status(204).send()
        }
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching comments collection'})
    }
}

module.exports = {
getAllPostComments,
getSingle,
createcomment,
updatecomment,
deletecomment
}