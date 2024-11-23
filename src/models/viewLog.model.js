// const mongoose = require("mongoose");
import mongoose from "mongoose";

const viewLogSchema = new mongoose.Schema({
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    viewedAt: { type: Date, default: Date.now },
},
// {timestamps: true}
);

export const ViewLog=mongoose.model("ViewLog",viewLogSchema)

