import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike=asyncHandler(async(req,res)=>{
    //get videoId and validate
    //check video is liked by user ??
    //if yes then remove like and send response
    //if no then add like and send response
    const {videoId}=req.params;
    const userId=req.user?._id

    if ( !videoId?.trim() || !isValidObjectId(videoId)) {
        throw new ApiError(400,"video is required")
    }
    const video = await Video.findOne({ _id: videoId, isPublished: true });

    if (!video) {
      throw new ApiError(404, "video not found or is not published");
    }
  

    const removeLiked=await Like.findOneAndDelete({videoId,likeById:userId})

    if (!removeLiked) {
        const createLike=await Like.create({
            videoId,
            likeById: userId,
        });
        if (!createLike) {
            throw new ApiError(500,"like not created")
        }
        return res
        .status(200)
        .json(new ApiResponse(200, { likeId: createLike?._id, state: true },"Like added"))
    }

    return res
    .status(200)
    .json(200,{likeId: null, state: false},"like removed")
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    //get videoId and validate
    //check video is commented by user ??
    //if yes then

    const {commentId}=req.params
    const userId=req.user?._id

    if (!commentId.trim() || !isValidObjectId(commentId)) {
        throw new ApiError(400,"comment is required")
    }

    const comment=await Comment.findOne({_id: commentId})
    if (!comment) {
        throw new ApiError(404,"comment not found")
    }

    const removeLiked=await Like.findOneAndDelete({commentId,likeById: userId})

    if (!removeLiked) {
        const createLike=await Like.create({
            commentId,
            likeById:userId
        })

        if (!createLike) {
            throw new ApiError(500,"like is not added")
        }
        return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { likeId: createLike?._id, state: true },
            "like added"
          )
        );
    }

    return res
    .status(200)
    .json(new ApiResponse(200, { likeId: null, state: false }, "like removed"));
})

export {
    toggleVideoLike
}