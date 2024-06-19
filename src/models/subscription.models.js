import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    // subscriber and channel both are User at the end
    subscriber:{
        type: mongoose.Schema.Types.ObjectId, //one who is subscribing my channel
        ref: "User"
    },
    channel:{
        type: mongoose.Schema.Types.ObjectId, //ones whom I have subscribed
        ref: "User"
    }

},{timestamps:true})


export const Subscription = mongoose.model('Subscription', subscriptionSchema)