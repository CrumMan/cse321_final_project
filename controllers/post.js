const mongodb = require('../db/connect');
const ObjectId = require('mongodb').ObjectId;


const getAll = async (req, res) => {
    try{
     mongodb
    .getDb()
    .collection('post')
    .find()
    .toArray()
    .then(posts => {
            if (!posts || posts.length === 0) {
        return res.status(400).json({ message: "No posts found" });
    }

        res.setHeader('content-type',' application/json')
        res.status(200).json(posts)
    })
}
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching posts collection'})
    }
}

const getSingle = async(req,res) => {
   try{
     if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Error 400: Invalid post ID format' });
  }
    const postId = new ObjectId(req.params.id)
    mongodb
    .getDb()
    .collection('post')
    .find({_id: postId})
    .toArray()
    .then(post => {
        if (!post || post.length === 0) {
        return res.status(400).json({ message: "No posts found" });
    }
         res.setHeader('content-type',' application/json')
         res.status(200).json(post[0])
    })}
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching posts collection'})
    }
}

const createPost = async (req,res) => {
    try{
        const id = req.params.id;
        if (!ObjectId.isValid(id)){
            return res.status(400).json({message:"ERR 400: Invalid user ID"})
        }
        const userId = new ObjectId(req.params.id)
            mongodb
            .getDb()
            .collection('user')
            .find({_id: userId})
            .toArray()
        
        const post = {
            userId: userId,
            content:req.body.content
        }
        const response = await mongodb
        .getDb()
        .collection('post')
        .insertOne(post)

        if(response.acknowledged > 0){
            res.status(201).send(response)
        } 
    }
catch(err){
        res.status(500).json({message:err.message || 'Error fetching posts collection'})
    }
}

const updatePost = async (req,res) => {
try{
    const id = req.params.id;
    if (!ObjectId.isValid(id)){
        return res.status(400).json({message: "ERR 400: Invalid user ID"})
    }
    const postId = new ObjectId(req.params.id);
    const existingPost = await mongodb
    .getDb()
    .collection('post')
    .findOne({_id: postId})
    if(!existingPost){
        return res.status(404).json({message: "Post not found"})
    }
        const post = {
            userId: existingPost.userId,
            content:req.body.content
        }
    const response = await mongodb
    .getDb()
    .collection('post')
    .replaceOne({ _id: postId }, post)

    res.status(201).json({ id: response.insertedId })

    if(response.modifiedCount > 0){
        res.status(204).send()
    }
}
catch(err){
        res.status(500).json({message:err.message || 'Error fetching posts collection'})
    }
}
const deletePost = async (req,res) => {
    try{
        const postId = new ObjectId(req.params.id)
        const response = await mongodb
        .getDb()
        .collection('post')
        .deleteOne({_id: postId},true)
        if (response.deletedCount > 0){
            res.status(204).send()
        }
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching posts collection'})
    }
}

module.exports = {
getAll,
getSingle,
createPost,
updatePost,
deletePost
}