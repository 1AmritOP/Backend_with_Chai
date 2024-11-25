import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.model.js"

const getVideoComment=asyncHandler(async(req,res)=>{
    //get videoId by params and validate
    //call DB and get data
    const {videoId}=req.params;
    
    const { page = 1, limit = 10 } = req.query

    if (!videoId?.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(400,"video is required")
    }

    const comments=await Comment.find({
        video: new mongoose.Types.ObjectId(videoId)
    })
    .sort({createdAt: -1})
    .skip((page - 1) * limit)
    .limit(limit)

    const totalComments=await Comment.countDocuments({
        video: new mongoose.Types.ObjectId(videoId)
    })

    if (!comments) {
        throw new ApiError(404,"comments not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,{
            comments,
            totalComments,
            totalPages: Math.ceil(totalComments / limit),
            currentPage: page,
        },"comments fetched successfully"
    ))
})

const addComment=asyncHandler(async(req,res)=>{
   // TODO: add a comment to a video
  //get videoId in Params
  //get comment from body
  //validate video id and comment is not empty or null
  //validate the video exited or not
  //add comment to video in db and also add user id and community id to it
  // send response

  const {videoId}=req.params
  const {content}=req.body


  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "video id is required");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "comment Content is required");
  }

  const video=await Video.findById(videoId)

  if (!video) {
    throw new ApiError(400,"video not found")
  }

  const comment=await Comment.create({
    content,
    video: videoId,
    owner: req.user?._id
  })

  if (!comment) {
    throw new ApiError(400, "comment not added");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added successfully"));

})

export{
    getVideoComment,
    addComment
}