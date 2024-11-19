import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema= new Schema(
    {
        videoFile: {
            url: {
                type: String, //cloudinary url
                required: true
            },
            publicId: {
                type: String, //cloudinary url
                required: true
            }
        },
        thumbnail: {
            url: {
                type: String, //cloudinary url
                required: true
            },
            publicId: {
                type: String, //cloudinary url
                required: true
            }
        },
        title: {
            type: String, 
            required: true
        },
        description:{
            type: String,
            required: true
        },
        views:{
            type: Number,
            default: 0
        },
        duration:{
            type: Number,
            required: true
        },
        isPublished:{
            type: Boolean,
            required: true
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        //to track unqiue viewes
        // viewers:{
        //     type:[Schema.Types.ObjectId],
        //     ref:"User",
        //     default:[]
        //   },
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Video=mongoose.model("Video",videoSchema)