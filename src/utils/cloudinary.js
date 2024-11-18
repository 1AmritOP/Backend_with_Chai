import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const deleteFileFromCloudinary = async (publicId) => {
    try {
      if (!publicId) {
        throw new ApiError(400, "No public id provided");
      }
      const response = await cloudinary.uploader.destroy(publicId);
      console.log("File is Deleted from Cloudinary -> ", response);
      if (response.result == "ok") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Cloudinary delete error:", error);
      throw new ApiError(500, "Failed to delete file from Cloudinary");
    }
  };


export {uploadOnCloudinary,deleteFileFromCloudinary}