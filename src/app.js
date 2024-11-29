import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app=express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// import routes
import userRouter from "./routes/user.routes.js"
import videoRoutes from "./routes/video.routes.js";
import likeRoutes from "./routes/like.routes.js"
import commentRoutes from "./routes/comment.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"

// route declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRoutes)
app.use("/api/v1/likes",likeRoutes)
app.use("/api/v1/comments",commentRoutes)
app.use("/api/v1/subscriptions",subscriptionRoutes)


export {app}