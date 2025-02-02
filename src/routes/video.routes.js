import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { deleteVideo, getDefaultVideos, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"


const router=Router()
// router.use(verifyJWT) //apply auth middleware to all routes

router.route("/publish-video").post(verifyJWT,upload.fields([
    {name: "videoFile", maxCount:1},
    {name: "thumbnailFile", maxCount:1}
]),publishAVideo)

router.route("/gt/:videoId").get(verifyJWT,getVideoById)
router.route("/:videoId").delete(verifyJWT,deleteVideo)
router.route("/toogle-publish/:videoId").patch(verifyJWT,togglePublishStatus)
router.route("/:videoId").patch(verifyJWT,updateVideo)
router.route("/default-video").get(getDefaultVideos)

export default router