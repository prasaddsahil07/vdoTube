import mongoose from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    let data = {};
    data.channelId = channelId;

    //getting all the videos and views
    try {
        const videos = await Video.find({
            owner: channelId
        })
        if (videos) {
            data.allVideos = videos
            const totalViews = videos.reduce((total, video) => total + video.view, 0);
            data.totalViews = totalViews
        }
    } catch (error) {
        data.allVideos = 0
        data.totalViews = 0
    }

    //getting channel total subscribers
    try {
        const subscribers = await Subscription.find({
            channel: channelId
        })
        const subscribersCount = subscribers.length;
        data.totalSubscribers = subscribersCount
    } catch (error) {
        data.totalSubscribers = 0

    }

    return res.status(200).json({ data });
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const videos = await Video.find({
        owner: channelId
    })
    if (!videos) {
        return res.status(404).json({ msg: "Videos can not be found", })
    }
    res.status(200).json({ msg: "Videos of this channel fetched successfully", data: videos })
})

const getAllVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({
        isPublished: true
    })
    if (!videos) {
        return res.status(404).json({ msg: "Videos can not be found", })
    }
    res.status(200).json({ msg: "Videos has been fetched successfully", data: videos })

})

export { getChannelStats, getChannelVideos, getAllVideos };