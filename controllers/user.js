const express = require('express');
const mongodb = require('../db/connect');
const { userInfo } = require('os');
const { MongoGridFSChunkError } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const getAll = async (req, res) => {
    try{
        const users = await mongodb
        .getDb()
        .collection('user')
        .find()
        .toArray()

        const userinfo = await mongodb
        .getDb()
        .collection('userInfo')
        .find()
        .toArray()

        const userInfoMapped = new Map(
            userinfo.map(info => [info._id.toString(), info])
        )
        const fullInformation = users.map(user => {
            const info = userInfoMapped.get(user._id.toString())
            if (info){ return {...user, ...info}}
            return {...user, message:"user info not added"}
        })
        res.setHeader('content-type', 'application/json');
        res.status(200).json(fullInformation);
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching users collection'})
    }
}


const getSingle = async(req,res) => {
    try{
        if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
        const userId = new ObjectId(req.params.id)
        const user = await mongodb
        .getDb()
        .collection('user')
        .findOne({_id: userId})

        const userInfo = await mongodb
        .getDb()
        .collection('userInfo')
        .findOne({_id: userId})

        if(!user || !userInfo){
            return res.status(404).json({message:'user or user Info not entered please create user info if it has not been created'})
        }
        const combinedData = {
            ...user, ...userInfo
        }
        
            res.setHeader('content-type',' application/json')
            res.status(200).json(combinedData)
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching users collection'})
    }
}

const saveUserInfo = async(req, res) => {
    try{
        console.log('Session:', req.session);
        console.log('User in session:', req.session.user);
        

        const sessionId = req.session.user._id||req.session.user.githubId;
        if (!sessionId){
            return res.status(401).json({message: "User not authorized"})
        }
        let userId;
        if (typeof sessionId === 'string' && ObjectId.isValid(sessionId)) {
            userId = new ObjectId(sessionId)
        } else if (sessionId instanceof ObjectId){
            userId = sessionId
        } else {
            userId = sessionId
        }
        const user = await mongodb
            .getDb()
            .collection('user')
            .findOne({ _id: userId })
        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }

    const userInfo ={
        _id : userId,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        favoriteColor: req.body.favoriteColor,
        gender: req.body.gender,
        auth: 'Client',
    }
    const response = await mongodb
    .getDb()
    .collection('userInfo')
    .insertOne(userInfo)
    
        if (response.acknowledged){

            await mongodb
            .getDb()
            .collection('user')
            .updateOne({_id: userId}, {$set: {hasCompletedInfo:true}})

            res.status(201).json({
                message: 'User info created successfully',
                id: response.insertedId
            })
        }
        else(
            res.status(400).json({message: 'failed to create user'})
        )

    }
    catch(err){
        console.log(err)
    }
}

const createUser = async (req,res) => {
  try{
        const user = {
            name: req.body.name,
            username: req.body.username,
            Password: req.body.Password,
            email: req.body.email,
            hasCompletedInfo: false,
            auth: 'Client',
            createdAt: new Date(),

        }
        const response = await mongodb
        .getDb()
        .collection('user')
        .insertOne(user)

        if(response.acknowledged){
            res.status(201).json({id: response.insertedId})
        }
        else{res.status(500).json({message: 'Failed to create User'})}
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching users collection'})
    }
}

const updateUser = async (req,res) => {
    try{
        const userId = new ObjectId(req.params.id);

        const currentUser = await mongodb
        .getDb()
        .collection('userInfo')
        .findOne({ _id: userId })
        const currentAuth = (currentUser && currentUser.auth) || 'Client'

        const user = {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        favoriteColor: req.body.favoriteColor,
        gender: req.body.gender,
        auth: currentAuth,
        }
        const response = await mongodb
        .getDb()
        .collection('userInfo')
        .replaceOne({ _id: userId }, user)

        if(response.modifiedCount > 0){
            res.status(204).send()
        } else if(response.error) {
            res.status(500).json(response.error || "An error occoured updating the server" )
        }
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching users collection'})
    }
}
const changeAuth = async (req,res) => {
            try{
                const userId = new ObjectId(req.params.id);
                const existingUser = await mongodb
                .getDb()
                .collection("user")
                .findOne(userId)
                if (!existingUser){
                    res.status(404).json({message:"User not found"})
                }
                const newAuth = req.body.auth
                if (!newAuth) {
                    return res.status(400).json
                }
                const response = await mongodb
                .getDb()
                .collection('userInfo')
                .updateOne({_id:userId}, {$set: {auth:newAuth}})
                if(response.modifiedCount > 0){
                    res.status(200).json({message:"User Auth level has been updated"})
                }
            }
            catch(err){
                res.status(500).json({message: err.message})
            }
        }

const deleteUser = async (req,res) => {
    try{
        const userId = new ObjectId(req.params.id)
        const userResponse = await mongodb
        .getDb()
        .collection('user')
        .deleteOne({_id: userId})
        
        const infoResponse = await mongodb
        .getDb()
        .collection('userInfo')
        .deleteOne({_id: userId})
        
        if (userResponse.deletedCount > 0){
            if (infoResponse.deletedCount > 0){
                res.status(200).json({message:"The User without info has been deleted"})
            }
            else{
                res.status(204).send()
            }
        }
        else{throw new error("user not found")}
    }
    catch(err){
        res.status(500).json({message:err.message || 'Error fetching users collection'})
    }
}

module.exports = {
getAll,
getSingle,
updateUser,
deleteUser,
saveUserInfo,
changeAuth
}