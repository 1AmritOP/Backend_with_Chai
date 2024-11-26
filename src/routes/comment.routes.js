import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { addComment, deleteComment, getVideoComment, updateComment } from "../controllers/comment.controller.js"

const router=Router()

router.use(verifyJWT)

router.route("/:videoId")
                        .get(getVideoComment)
                        .post(addComment)

router.route("/c/:commentId").patch(updateComment)
                            .delete(deleteComment)

export default router