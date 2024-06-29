// import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {Video} from '../models/video.models.js'
import {ApiError} from "../utils/ApiError.js"
// import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    let filters ={}             // mongoose agggregate paginate syntax

    if (videoId) {
        filters.video = videoId;
    }
    const {page = 1, limit = 10} = req.query

    const VideoComments = await Comment.find(filters).skip((page - 1) * limit)
    .limit(parseInt(limit));
    

    return res.status(200).json({VideoComments})

})

const addComment = asyncHandler(async (req, res) => {
    const {comment} = req.body
    const {videoId} =req.params

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(401, "video can not be found")
    }

    const createComment = await Comment.create({
        content: comment,
        video,
        owner:req.user


    })
    return res.status(200).json({msg:"comment added successfully" ,data:createComment})
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const {newComment} = req.body

    if(!newComment){
        throw new ApiError(401, "please enter some data for new tweet")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set:{
            content: newComment
        }
    }, {new:true})

    if(!updatedComment){
        throw new ApiError(402, "comment can not be updated right now")

    }

    return res.status(200).json({msg:"Comment updated successfully", data:updatedComment})
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    const response = await Comment.deleteOne({_id:commentId})
    return res.status(200).json({msg:"Comment deleted successfully", data:response})
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}