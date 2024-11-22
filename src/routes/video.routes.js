import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"


const router=Router()
router.use(verifyJWT) //apply auth middleware to all routes

router.route("/publish-video").post(upload.fields([
    {name: "videoFile", maxCount:1},
    {name: "thumbnailFile", maxCount:1}
]),publishAVideo)

router.route("/:videoId").get(getVideoById)
router.route("/:videoId").delete(deleteVideo)
router.route("/toogle-publish/:videoId").patch(togglePublishStatus)
router.route("/:videoId").patch(updateVideo)

export default router