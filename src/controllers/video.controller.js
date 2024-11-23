import  mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFileFromCloudinary, deleteVideoFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";
import { ViewLog } from "../models/viewLog.model.js";


const MIN_IMAGE_FILE_SIZE = 20 * 1024; // 20 KB
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const allowedImageMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "image/avif",
  "image/gif",
];

const MIN_VIDEO_FILE_SIZE = 20 * 1024; // 20 KB
const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

const allowedVideoMimeTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/3gpp",
  "video/x-msvideo",
  "video/quicktime",
  "video/x-matroska",
  "video/x-flv",
  "video/avi",
  "video/x-ms-wmv",
];

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  //myTODO :
  // get video title,description,videoFile,thumbnail
  //validate the title ,description --->based on string
  //validate thumbnail on base of image
  //validate video on base of video
  //upload video and thumbnail on cloudniary
  //add the to sb with owner info
  //send response

  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    //Works for all falsy values (null, undefined, empty string).
    throw new ApiError(406, "title and description are required");
  }

  //   if (title?.trim() === "" || description?.trim() === "") {
  //     //Only works if the value is "". Ignores null or undefined.
  //     throw new ApiError(406, "title and description is required");
  //   }

  if (title.trim().length < 3) {
    throw new ApiError(411, "title should be at least 3 letters");
  }
  if (description.trim().length < 10) {
    throw new ApiError(411, "description should be at least of 3 letters");
  }
  const { videoFile, thumbnailFile } = req.files;

  const thumbnailFilePath = thumbnailFile[0]?.path;
  const videoFilePath = videoFile[0]?.path;

  if (!thumbnailFilePath || !videoFilePath) {
    throw new ApiError(406, "thumbnail and video are required");
  }

  const { mimetype: thumbnailMimeType, size: thumbnailSize } = thumbnailFile[0];
  if (!allowedImageMimeTypes.includes(thumbnailMimeType)) {
    throw new ApiError(406, "thumbnail should be image");
  }

  if (
    thumbnailSize < MIN_IMAGE_FILE_SIZE ||
    thumbnailSize > MAX_IMAGE_FILE_SIZE
  ) {
    throw new ApiError(406, "thumbnail size should be between 20KB and 5MB");
  }

  const { mimetype: videoMimeType, size: videoSize } = videoFile[0];

  if (!allowedVideoMimeTypes.includes(videoMimeType)) {
    throw new ApiError(406, "videoFile should be videoType");
  }

  if (videoSize < MIN_VIDEO_FILE_SIZE || videoSize > MAX_VIDEO_FILE_SIZE) {
    throw new ApiError(406, "video size should be between 20KB and 100MB");
  }

  const thumbnailResponse = await uploadOnCloudinary(thumbnailFilePath);
  if (!thumbnailResponse?.url || !thumbnailResponse?.public_id) {
    throw new ApiError(500, "thumbnail is not uplaoded on cloudinary");
  }

  const videoResponse = await uploadOnCloudinary(videoFilePath);
  if (!videoResponse?.url || !videoResponse?.public_id) {
    throw new ApiError(500, "Video is not uplaoded on cloudinary");
  }

  const user = req?.user._id;

  const videoAddedToDB = await Video.create({
    videoFile: {
      url: videoResponse.url,
      publicId: videoResponse.public_id,
    },
    thumbnail: {
      url: thumbnailResponse.url,
      publicId: thumbnailResponse.public_id,
    },
    title,
    description,
    owner: user,
    duration: videoResponse.duration,
    isPublished: true,
  });

  if (!videoAddedToDB) {
    throw new ApiError(500, "video is not added to DB");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, videoAddedToDB, "video is published successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  //then check if video published or not
  //if published then return videourl , thumbnailurl, title, description

  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!videoId?.trim() || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const isVideoPublished = await Video.findOne({
    _id: videoId,
    isPublished: true,
  });

  if (!isVideoPublished) {
    throw new ApiError(406, "video is not published");
  }

  const video = await Video.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(videoId), isPublished: true },
    },
    {
      $project: {
        videoFile: "$videoFile.url",
        thumbnail: "$thumbnail.url",
        title: 1,
        description: 1,
        views:1,
        owner: 1
      },
    },
    // Fetch channel owner information
    {
      $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"channelOwner",
        pipeline:[
          {$project: {username:1,avatar:1}},
        ]
      },
      
    },
    { $unwind: "$channelOwner" },
    // {
    //   $addFields:{
    //     channelOwner: {
    //       $first: "$channelOwner"
    //     }
    //   }
    // },
    {
      $lookup:{
        from:"subscriptions",
        localField:"owner",
        foreignField:"channel",
        as:"subs",
        pipeline: [{ $project: { subscriber: 1 } }],
      }
    },
    {
      $addFields:{
        isSubscribed: { $in: [userId, "$subs.subscriber"] },
        subscriberCount:{ $size: "$subs" },
      }
    },
    {
      $lookup:{
        from:"comments",
        localField:"_id",
        foreignField:"video",
        pipeline: [
          {$sort: {updatedAt: -1}},
          {$limit: 10},
          {
            $lookup:{
              from:"users",
              localField:"owner",
              foreignField:"_id",
              pipeline: [
                  {
                    $project:{
                      username: 1,
                      avatar: 1 //"$avatar.url" i have to update user model and user controller
                    }
                  }
              ],
              as:"commentedBy"
            },
          },
          { $unwind: "$commentedBy" }, // batter than first ,.. check documentation
          {
            $lookup: {
              from:"likes",
              localField:"_id",
              foreignField:"commentId",
              pipeline: [{$project: {likeById: 1}}],
              as:"likesOnComment"
            }
          },
          {
            $addFields: {
              likeCount: {$size: "$likesOnComment"},
              isLikedByUser: {$in : [userId , "$likesOnComment.likeById"]}
            }
          },
          {
            $project: {
              _id: 1,
              content: 1,
              commentBy: "$commentedBy.userName",
              commentByAvatar: "$commentedBy.avatar",
              likeCount: 1,
              isLikedByUser: 1,
            },
          }
        ],
        as:"comments"
      }
    },
    {
      $lookup: {
        from:"likes",
        localField:"_id",
        foreignField:"videoId",
        as:"likes"
      }
    },
    {
      $addFields: {
        likesCount: {$size: "$likes.likeById"},
        likedByUser:{ $in: [userId, "$likes.likeById"]}
      }
    },
    { $unset: ["likes", "subs"] },
  ]);

  // const video = await Video.aggregate([
  //   {
  //     $match: { _id: new mongoose.Types.ObjectId(videoId), isPublished: true },
  //   },
  //   {
  //     $project: {
  //       videoFile: "$videoFile.url",
  //       thumbnail: "$thumbnail.url",
  //       title: 1,
  //       description: 1,
  //       views: 1,
  //       owner: 1,
  //     },
  //   },
  //   // Fetch channel owner information
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "owner",
  //       foreignField: "_id",
  //       pipeline: [{ $project: { userName: 1, avatar: "$avatar.url" } }],
  //       as: "channelOwner",
  //     },
  //   },
  //   { $unwind: "$channelOwner" },
  //   // Fetch subscriber information
  //   {
  //     $lookup: {
  //       from: "subscriptions",
  //       localField: "owner",
  //       foreignField: "channelId",
  //       pipeline: [{ $project: { subscriberId: 1 } }],
  //       as: "subscribers",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       isSubscribed: { $in: [userId, "$subscribers.subscriber"] },
  //       subscriberCount: { $size: "$subscribers" },
  //     },
  //   },
  //   // Fetch video comments
  //   {    
  //     $lookup: {
  //       from: "comments",
  //       localField: "_id",
  //       foreignField: "video",
  //       pipeline: [
  //         { $sort: { updatedAt: -1 } },
  //         { $limit: 10 },
  //         {
  //           $lookup: {
  //             from: "users",
  //             localField: "owner",
  //             foreignField: "_id",
  //             pipeline: [{ $project: { userName: 1, avatar: "$avatar.url" } }],
  //             as: "commentedBy",
  //           },
  //         },
  //         { $unwind: "$commentedBy" },
  //         {
  //           $lookup: {
  //             from: "likes",
  //             localField: "_id",
  //             foreignField: "commentId",
  //             pipeline: [{ $project: { likeById: 1 } }],
  //             as: "likesOnComment",
  //           },
  //         },
  //         {
  //           $addFields: {
  //             likeCount: { $size: "$likesOnComment" },
  //             isLikedByUser: { $in: [userId, "$likesOnComment.likeById"] },
  //           },
  //         },
  //         {
  //           $project: {
  //             _id: 1,
  //             content: 1,
  //             commentBy: "$commentedBy.userName",
  //             commentByAvatar: "$commentedBy.avatar",
  //             likeCount: 1,
  //             isLikedByUser: 1,
  //           },
  //         },
  //       ],
  //       as: "comments",
  //     },
  //   },
  //   // Fetch likes on video
  //   {
  //     $lookup: {
  //       from: "likes",
  //       localField: "_id",
  //       foreignField: "videoId",
  //       pipeline: [{ $project: { likeById: 1 } }],
  //       as: "likes",
  //     },
  //   },
  //   {
  //     $addFields: {
  //       likesCount: { $size: "$likes.likeById" },
  //       isLikedByUser: { $in: [userId, "$likes.likeById"] },
  //     },
  //   },
  //   { $unset: ["likes", "subscribers"] },
  // ]);

  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }

  // const updateWatchHistory = await User.updateOne(
  //   { _id: userId, "watchHistory.videoId": new mongoose.Types.ObjectId(videoId) },  // Check if the videoId exists
  //   {
  //     $set: {
  //       "watchHistory.$.lastWatchedAt": new Date(),  // Update the lastWatchedAt timestamp
  //     },
  //   }
  // );

  //add video in watch histoy with time and date

  // if (updateWatchHistory.matchedCount === 0) {
  //   // If the video doesn't exist, add it to the watch history
  //   await User.updateOne(
  //     { _id: userId },
  //     {
  //       $push: {
  //         watchHistory: {
  //           videoId: new mongoose.Types.ObjectId(videoId),
  //           lastWatchedAt: new Date(),
  //         },
  //       },
  //     }
  //   );
  // }

  // const updateWatchHistory = await User.updateOne(
  //   { _id: userId }, // Find the document where `_id` matches the given userId
  //   {
  //     $addToSet: {
  //         watchHistory: new mongoose.Types.ObjectId(videoId),
  //     },
  //   },
  //   // { upsert: true }
  // );  //simple method to add video in watch history


  const updateWatchHistory = await User.updateOne({ _id: userId }, [
    {
      $set: {
        watchHistory: {
          $concatArrays: [
            [new mongoose.Types.ObjectId(videoId)], // New video at the start
            {
              $filter: {
                input: "$watchHistory",
                as: "video",
                cond: {
                  $ne: ["$$video", new mongoose.Types.ObjectId(videoId)],
                }, // Remove duplicates
              },
            },
          ],
        },
      },
    },
  ]);

  if (!updateWatchHistory) {
    throw new ApiError(406, "not added in watchHistory");
  }

  const alreadyViewed= await ViewLog.findOne({videoId,userId })
  if (!alreadyViewed) {
    await ViewLog.create({videoId,userId})

    await Video.findByIdAndUpdate(videoId,{
      $inc: {views:1}
    }, {new: true})
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video Retrieved Successfully"));
});

const deleteVideo=asyncHandler(async(req,res)=>{
  //get video id by params
  //then check validation
  //insure that only owner can delete the video
  //then delete video,thumbnail from cloudinary
  // delete video  from DB
  //and send response

  const {videoId}=req.params

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(404,"videoId is not valid")
  }
  const video=await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404,"video not found")
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError(403, 'You are not authorized to delete this video')
  }

  // const videoPublicId=video.videoFile.publicId
  // const thumbnailPublicId=video.thumbnail.publicId

  const videoResponse=deleteVideoFromCloudinary(video.videoFile.publicId)

  if (!videoResponse) {
    throw new ApiError(500,"video is not deleted")
  }

  const thumbnailResponse=deleteFileFromCloudinary(video.thumbnail.publicId)

  if (!thumbnailResponse) {
    throw new ApiError(500,"thumbnail is not deleted")
  }


  const delVideo=await Video.findByIdAndDelete(videoId)

  if (!delVideo) {
    throw new ApiError(500,"video is not deleted from DB")
  }
  
  return res
  .status(200)
  .json(new ApiResponse(200,{},"video deleted from DB and cloud"))
})

const togglePublishStatus=asyncHandler(async(req,res)=>{
  //get videoId 
  //validate videoId
  //ensure owner is making change
  //update the video
  const {videoId}=req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400,"videoId is not valid")
  }

  const video=await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404,"video not found")
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError(403, 'You are not authorized to update info')
  }
  
  const updateVideo=await Video.findByIdAndUpdate(
    videoId,
    {isPublished: !video.isPublished },
    {new: true}
  )

  if (!updateVideo) {
    throw new ApiError(500,"Error while updating video")
  }

  return res
  .status(200)
  .json(
    new ApiResponse(200,updateVideo,"Video is updated...")
  )
})

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details --> title,description
  //validate videoId
  //get title and description
  //ensure owner is making change
  //update the video
  const { videoId } = req.params
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400,"Video Id is not valid")
  }
  const {title ,description} =req.body

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400,"title and desciption is required")
  }
  const video=await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404,"video not found")
  }

  if (!video.owner.equals(req.user?._id)) {
    throw new ApiError(403, 'You are not authorized to update info')
  }

  const videoUpdateRes=await Video.findByIdAndUpdate(
    videoId,
    {
      $set:{
        title,
        description
      }
    },
    {new: true}
  ).select("title description")

  return res
  .status(200)
  .json(new ApiResponse(200, { videoUpdateRes }, "Accound Updated successfully"));
})

const getDefaultVideos = asyncHandler(async(req,res)=>{
  // try {
    const videos = await Video.aggregate([{ $sample: { size: 10 } }]); // Random 10 videos
    if (!videos) {
      throw new ApiError(500,"videos not found")
    }
    res.status(200).json(new ApiResponse(200,{videos},"videos Fetched .."));
// } catch (err) {
//     res.status(500).json( new ApiResponse() { error: "Failed to fetch default videos" });
// }
})


export { 
  publishAVideo,
  getVideoById,
  deleteVideo ,
  togglePublishStatus ,
  updateVideo,
  getDefaultVideos
};
