import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
// import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;
    const owner = req.user._id;
    const postTweet = await Tweet.create({
        content: tweet,
        owner
    });

    return res.status(200).json({ msg: "tweet posted successfully", data: postTweet });
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    let filters = {};

    if (userId) {
        filters.owner = userId;
    }

    // Fetch videos with pagination, filtering, and sorting
    const tweets = await Tweet.find(filters);

    if (tweets.length === 0) {
        return res.status(404).json({ success: false, error: 'No tweets found' });
    }

    return res.status(200).json({ success: true, data: tweets });
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweet } = req.body;
    const { tweetId } = req.params;

    if (!tweet) {
        return res.status(200).json({ msg: "Please enter some text" });
    }

    const updatedTweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: req.user._id }, 
        { $set: { content: tweet } },
        { new: true }
    );

    return res.status(200).json({ msg: "tweet updated successfully", data: updatedTweet });
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const deleted = await Tweet.findOneAndDelete({ _id: tweetId, owner: req.user._id });
    if (!deleted) {
        return res.status(404).json({ msg: "Tweet not found or unauthorized" });
    }

    return res.status(200).json({ msg: "tweet deleted successfully", data: response });
})

const getAllTweets = asyncHandler(async (req, res) => {
    const page = 1;
    const limit = 10;

    const tweets = await Tweet.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

    if (tweets.length === 0) {
        return res.status(404).json({ success: false, error: "No tweets found" });
    }

    return res.status(200).json({ success: true, data: tweets });
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets
}
