import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import {asyncHandler} from "../utils/asyncHandler.js"



const toggleSubscription = asyncHandler(async (req, res) => {
    const userId = req.user._id; // Assuming you have user information in req.user
    const {channelId} = req.params

    try {
        // Check if the user is already subscribed to the channel
        const existingSubscription = await Subscription.findOne({
            subscriber: userId,
            channel: channelId
        });

        if (existingSubscription) {
            // If the user is already subscribed, unsubscribe
            await Subscription.deleteOne({
                subscriber: userId,
                channel: channelId
            });
            res.json({ subscribed: false });
        } else {
            // If the user is not subscribed, subscribe
            await Subscription.create({
                subscriber: userId,
                channel: channelId
            });
            res.json({ subscribed: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
});

// controller to return total subscribers of a channel
const getChannelTotalSubscribers = asyncHandler(async (req, res) => {

    const {channelId} = req.params
    
    let filters= {}
    filters.channel = channelId

    const subscribers = await Subscription.find(filters)
    const subscribersCount = subscribers.length;

    return res.status(200).json({msg:"total subscribers of channel fetch successfully", data:{subscribers,subscribersCount}})
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    let filters= {}
    filters.subscriber = subscriberId

    const channels = await Subscription.find(filters)
    const channelsCount = channels.length;

    return res.status(200).json({msg:"channels where user subscribed fetch successfully", data:{channels,channelsCount}})
})

const checkIfSubscribed = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const user = req.user

    const isSubscribed = await Subscription.findOne({
          channel:channelId,
          subscriber:user._id
    })
    
    const responseData = {
        subscribed: !!isSubscribed, 
        msg: !!isSubscribed ? 'channel already subscribed' : 'channel not subscribed'
    };

    return res.status(200).json(responseData)
})



export {
    toggleSubscription,
    getChannelTotalSubscribers,
    getSubscribedChannels,
    checkIfSubscribed
}