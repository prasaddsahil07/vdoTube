import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description, category } = req.body;

    const owner = req.user._id;

    if (!name || !description) {
        return res.status(401).json({ msg: "Please fill all the fields" });
    }

    const playlist = await Playlist.create({
        name,
        description,
        category,
        owner
    })

    if (!playlist) {
        return res.status(402).json({ msg: "Playlist cannot be created" });
    }

    return res.status(200).json({ msg: "Playlist created successfully", data: playlist });
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    let filters = {};
    const { userId } = req.params;

    if (userId) {
        filters.owner = userId;
    }

    const userPlaylists = await Playlist.find(filters);

    if (userPlaylists.length === 0) {
        return res.status(404).json({ msg: "Can't find any playlist for this user" })
    }

    return res.status(200).json({ msg: "Playlist fetched successfully", data: userPlaylists });
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        return res.status(404).json({ msg: "Error while finding playlist or playlist do not exists" });
    }

    return res.status(200).json({ msg: "playlist fetched successfully", data: playlist });
})


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Ensure the video exists
    const video = await Video.findById(videoId);
    if (!video) {
        return res.status(404).json({ msg: "Can't find video with this videoId" });
    }

    // Only add video if it doesn't already exist in playlist
    const updatedPlaylist = await Playlist.findOneAndUpdate(
        { _id: playlistId, "videos.video": { $ne: videoId } }, // condition: playlist exists AND video not already inside
        { $push: { videos: { video: videoId, thumbnail: video.thumbnail } } }, // push video to array
        { new: true } // return updated playlist
    );

    if (!updatedPlaylist) {
        // Means playlist not found OR video already in playlist
        return res.status(400).json({ msg: "Video already exists in the playlist or playlist not found" });
    }

    return res.status(200).json({ msg: "Video added to playlist successfully", data: updatedPlaylist });
})

// const addVideoToPlaylist = asyncHandler(async (req, res) => {
//     const { playlistId, videoId } = req.params;
//     const video = await Video.findById(videoId);
//     const playlist = await Playlist.findById(playlistId);


//     if (!video) {
//         return res.status(404).json({ msg: "Can't found video with this videoId" });
//     }

//     // Check if the video is already in the playlist
//     if (!playlist) {
//         return res.status(404).json({ msg: "Can't find playlist with this playlistId" });
//     }

//     const existingVideoIndex = playlist.videos.findIndex(vid => vid.video.toString() === videoId);

//     if (existingVideoIndex !== -1) {
//         return res.status(400).json({ msg: "Video already exists in the playlist" });
//     }

//     const videoData = {
//         video: videoId,
//         thumbnail: video.thumbnail
//     }

//     const addVideo = await Playlist.findByIdAndUpdate(playlistId, { $addToSet: { videos: videoData } }, // Use $push to add the videoId to the videos array
//         { new: true } // To return the updated playlist after the update
//     );

//     if (!addVideo) {
//         return res.status(402).json({ msg: "Video can not be added to the playlist" });
//     }

//     return res.status(200).json({ msg: "Video added to playlist successfully", data: addVideo });
// })

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const video = await Video.findById(videoId)

    if (!video) {
        return res.status(404).json({ msg: "Can't found video with this videoId" })
    }
    const removedVideo = await Playlist.findByIdAndUpdate(playlistId,
        { $pull: { videos: { video: videoId } } }, // Use $push to add the videoId to the videos array
        { new: true } // To return the updated playlist after the update
    );

    if (!removedVideo) {
        return res.status(402).json({ msg: "Video can not be removed to the playlist" });
    }

    return res.status(200).json({ msg: "Video removed to playlist successfully", data: removedVideo });
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    
    const response = await Playlist.findByIdAndDelete(playlistId);
      
    if(!response){
        return res.status(402).json({msg:"failed to find playlst and delete"});
    }

    return res.status(200).json({msg:"playlist deleted successfully", data:response});
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    if(!name && !description){
        return res.status(401).json({msg:"please enter atleast one field to update"});
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $set:{
            name,
            description
        }
    }, {new : true});

    if(!updatedPlaylist){
        return res.status(400).json({msg:"failed to update playlist"});
    }
    return res.status(200).json({msg:"playlist updated successfully", data:updatedPlaylist});
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
