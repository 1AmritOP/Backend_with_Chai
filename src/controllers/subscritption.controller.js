import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { Subscription } from "../models/subscription.model";
import { ApiResponse } from "../utils/ApiResponse";

const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription
    //get channelId from params
    //then check if user has subscribed to channel or not
    //if subscribed then
    //unsubscribe from channel
    //else
    //subscribe to channel
    //return response
   const { channelId } = req.params;
 
   const user =req.user._id; // it is as susbsriberid
   if(!channelId.trim() || !isValidObjectId(channelId)){
     throw new ApiError(406,"channel id is required");
   }
    const channel = await User.findById({_id:channelId});
    if(!channel){
     throw new ApiError(404,"channel not found");
    }
    const isSubsribed = await Subscription.findOneAndDelete({subscriber:user,channel:channelId});
    if(!isSubsribed){
     const createSubscription = await Subscription.create({
       subscriber:user,
       channel:channelId,
     })
     if(!createSubscription){
       throw new ApiError(404,"subscription not created");
     }
     return res.status(200).json(new ApiResponse(200,{Subscription:createSubscription._id,state:true},"subscription created"));
    }
    return res.status(200).json(new ApiResponse(200,{Subscription:null,state:false},"subscription removed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers=asyncHandler(async(req,res)=>{
   const channelId=req.params

   if (!channelId?.trim() || !isValidObjectId(channelId)) {
    throw new ApiError(400,"Channel Id is required")
   }

   const subscribers=await Subscription.aggregate([
    {
      $match:{
        channel: new mongoose.Types.ObjectId(channelId)
      }
    },
    {
      $lookup:{
        from:"users",
        localField:"subscriber",
        foreignField:"_id",
        as:"subscribers",
        pipeline:[
          {
            $project:{
              username:1,
              fullName:1,
              email:1
            }
          }
        ]
      }
    },
    {
      $addFields:{
        subscriber:{
          $arrayElemAt: ['$subscribers', 0],
        }
      }
    },
    {
      $project:{
        subscriber:1
      }
    }
   ])

   return res
   .status(200)
   .json(
       new ApiResponse(
           200,
           subscribers,
           'Subscribers fetched successfully'
       )
   )

})

export{
  toggleSubscription,
  getUserChannelSubscribers
}