import { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
  if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");
  //TODO: get video by id

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video found successfully"));
});


export {
  publishAVideo, 
  getVideoById 
};
