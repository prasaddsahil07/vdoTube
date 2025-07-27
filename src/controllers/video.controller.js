import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary, deleteOldImageFromCloudinary, deleteVideoFromCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    let filters = {};

    //sorting it by video owner

    if (userId) {
        filters.owner = userId;
    }


    // Apply search query if provided
    if (query) {
        // Example: search by video title or description
        filters.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    //sorting video like newest vidoes or oldest
    let sortOptions = {};
    if (sortBy) {
        sortOptions[sortBy] = sortType === 'newest' ? -1 : 1;
    }

    try {
        // Fetch videos with pagination, filtering, and sorting
        const videos = await Video.find(filters).sort(sortOptions)
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        return res.status(200).json({ success: true, data: videos });
    } catch (error) {
        return res.status(500).json({ success: false, error: 'Server error' });
    }

})


const publishAVideo = asyncHandler(async (req, res) => {

    const { title, description, category } = req.body

    if (!title || !description || !category) {
        return res.status(400).json({ msg: "Please provide all required fields." });
    }

    const videoLocalPath = req.files?.video[0]?.path

    let thumbnailLocalPath;

    if (req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailLocalPath = req.files.thumbnail[0].path
    }


    //upload video on cloudinary
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    //checking if files successfully uploaded

    if (!videoFile) {
        throw new ApiError(400, 'Video file is required')
    }

    if (!thumbnail) {
        throw new ApiError(400, 'Thumbnail is required')
    }

    //creating new video in database

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user,
        thumbnail: thumbnail.url,
        category
    })
    if (!video) {
        throw new ApiError(401, "failed to upload video")
    }


    return res.status(200).json({ msg: "Video Published Successfully", data: video })

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Invalid Video request or Video ID")
    }

    res.status(200).json({ msg: "Video fetched successfuly", video })
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    const thumbnailLocalPath = req.file?.path

    //making sure user atleast updating one thing

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(401, "All fields are required")
    }

    //making sure code don't run if user do not want to update thumbnail
    let thumbnail;
    let thumbnailUrl;

    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            throw new ApiError(402, "thumnail file is required")
        }
        thumbnailUrl = thumbnail.url

    }

    //finding video by id and updating it 

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        {
            $set: {
                title, description, thumbnail: thumbnailUrl
            }
        },
        { new: true })


    return res.status(200).json({ msg: "Video details updated successfully", data: updatedVideo })

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json({ msg: "Video not found" });
    }

    //deleting files from cloudinary
    await deleteVideoFromCloudinary(video.videoFile)
    await deleteOldImageFromCloudinary(video.thumbnail)

    //deleting video from database
    const response = await Video.deleteOne({ _id: videoId })

    return res.status(200).json({ data: { response } })
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json({ msg: "Video not found" });
    }

    // Toggle the isPublished status
    video.isPublished = !video.isPublished;

    // Save the updated video
    const updatedVideo = await video.save();

    return res.status(200).json({ msg: "publish status toggled successfully", data: updatedVideo })

})

const watchedStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    await Video.findByIdAndUpdate(videoId,
        { $inc: { view: 1 } }, // Increment the views field by 1
        { new: true } // Return the updated document
    )

    const watchHistory = await User.findByIdAndUpdate(req.user._id,
        { $addToSet: { watchHistory: videoId } },
        { new: true })

    if (!watchHistory) {
        return res.status(400).json({ msg: "failed to add video into watchHistory" })
    }

    return res.status(200).json({ msg: "video added to the watch history" })
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    watchedStatus
};