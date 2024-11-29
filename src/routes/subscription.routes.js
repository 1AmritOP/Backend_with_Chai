// const { Router } = require("express");
import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscritption.controller.js"


const router=Router()

router.use(verifyJWT)

router.route("/:channelId").post(toggleSubscription)
router.route("/gt-subs/:channelId").get(getUserChannelSubscribers)

export default router