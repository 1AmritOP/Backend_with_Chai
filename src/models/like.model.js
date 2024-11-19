import { Schema, model } from "mongoose";
import  mongooseAggregatePaginate  from "mongoose-aggregate-paginate-v2";
const likeSchema = new Schema(
  {
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    videoId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: "Community",
    },
    likeById: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
likeSchema.plugin(mongooseAggregatePaginate);
export const Like = model("Like", likeSchema);