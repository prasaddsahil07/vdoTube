import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    videos:[
        {
            video: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            },
            // Add a thumbnail field for each video reference
            thumbnail: String
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{
    timestamps:true
})

export const Playlist = mongoose.model("Playlist", playlistSchema)