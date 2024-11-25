import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addComment, getVideoComment } from "../controllers/comment.controller.js"

const router=Router()

router.use(verifyJWT)

router.route("/:videoId")
                        .get(getVideoComment)
                        .post(addComment)

export default router