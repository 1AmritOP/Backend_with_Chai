import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getVideoById, publishAVideo } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"


const router=Router()
router.use(verifyJWT) //apply auth middleware to all routes

router.route("/publish-video").post(upload.fields([
    {name: "videoFile", maxCount:1},
    {name: "thumbnailFile", maxCount:1}
]),publishAVideo)

router.route("/:videoId").get(getVideoById)

export default router