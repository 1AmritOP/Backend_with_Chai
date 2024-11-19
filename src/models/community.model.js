import { Schema, model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const communitySchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    media: {
      url: {
        type: String, //cloudnary url
        required: true,
      },
      publicId: {
        type: String, //cloudnary url
        required: true,
      },
    },
    content: {
      type: String,
      required: true,
      trim: true,
      min: 10,
      max: 500,
    },
    likeId: {
      type: Schema.Types.ObjectId,
      ref: "Like",
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);
// communitySchema.plugin(mongooseAggregatePaginate);
export const Community = model("Community", communitySchema);