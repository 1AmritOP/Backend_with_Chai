import { isValidObjectId } from "mongoose";
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
   if(!channelId || !isValidObjectId(channelId)){
     throw new ApiError(406,"channel id is required");
   }
    const channel = await User.findById({_id:channelId});
    if(!channel){
     throw new ApiError(404,"channel not found");
    }
    const isSubsribed = await Subscription.findOneAndDelete({subscriberId:user,channelId:channelId});
    if(!isSubsribed){
     const createSubscription = await Subscription.create({
       subscriberId:user,
       channelId:channelId,
     })
     if(!createSubscription){
       throw new ApiError(404,"subscription not created");
     }
     return res.status(200).json(new ApiResponse(200,{Subscription:createSubscription._id,state:true},"subscription created"));
    }
    return res.status(200).json(new ApiResponse(200,{Subscription:null,state:false},"subscription removed"));
 });
 